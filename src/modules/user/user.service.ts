import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { InjectRepository } from "@nestjs/typeorm";
import { Buffer } from "buffer";
import { Equal, FindOneOptions, Repository } from "typeorm";
import { ShopEntity } from "../shop/shop.entity";
import { CreateUserDto, FindUserDto, UpdateUserDto } from "./user.dto";
import {
    RoleEntity,
    UserEntity,
    UserShopEntity,
    UserShopRoleEntity,
} from "./user.entity";
import { ConfigService } from "@nestjs/config";
import { genSaltSync, hash } from "bcrypt";

@Injectable()
export class UserService {
    salt: string;
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        @InjectRepository(UserShopEntity)
        private readonly userShopRepo: Repository<UserShopEntity>,
        @InjectRepository(UserShopRoleEntity)
        private readonly userShopRoleRepo: Repository<UserShopRoleEntity>,
        private readonly eventEmitter: EventEmitter2,
        private readonly configService: ConfigService
    ) {
        const round =
            +this.configService.get<number>("SECRET_HASH_ROUND") || 10;
        this.salt = genSaltSync(round);
    }

    async hashSecret(secret: string) {
        return await hash(secret, this.salt);
    }

    async createUser(
        payload: CreateUserDto & { username: string; secret: string }
    ): Promise<UserEntity> {
        const user = new UserEntity();
        // required
        user.username = payload.username;
        user.secret = await this.hashSecret(payload.secret);
        user.names = payload.names;

        // optional
        user.email = payload.email ?? null;
        user.address = payload.address ?? null;
        user.bank = payload.bank ?? null;
        user.birth = payload.birth ?? null;

        try {
            await this.userRepo.save(user);
        } catch (error) {
            throw new HttpException(
                "USER_REQUIREMENT_FAIL",
                HttpStatus.BAD_REQUEST
            );
        }

        this.eventEmitter.emit("create_cart", user.id);

        return user;
    }

    async addUserToShop(
        shop: ShopEntity,
        user: UserEntity
    ): Promise<UserShopEntity> {
        const userShop = new UserShopEntity();

        userShop.shop = shop;
        userShop.user = user;

        try {
            await this.userShopRepo.save(userShop);
        } catch (error) {
            throw new HttpException(
                "FAIL_TO_ADD_USER_TO_SHOP",
                HttpStatus.CONFLICT
            );
        }

        return userShop;
    }

    async updateUser(
        payload: UpdateUserDto,
        userId: string
    ): Promise<UserEntity> {
        const user = await this.getUserById(userId);
        user.address = payload.address ?? user.address;
        user.email = payload.email ?? user.email;
        user.names = payload.names ?? user.names;
        payload?.secret &&
            (user.secret = await this.hashSecret(payload?.secret));

        try {
            await this.userRepo.save(user);
        } catch (error) {
            throw new HttpException(
                "USER_REQUIREMENT_FAIL",
                HttpStatus.BAD_REQUEST
            );
        }

        return await this.getUserById(user.id);
    }

    async getUserById(id: string): Promise<UserEntity> {
        let user: UserEntity;
        const filter: FindOneOptions<UserEntity> = {};
        filter.where = { id: Equal(id) };

        filter.relations = { shops: { roles: { role: true }, shop: true } };

        try {
            user = await this.userRepo.findOneOrFail(filter);
        } catch (error) {
            throw new HttpException("USER_DOESNT_EXIST", HttpStatus.NOT_FOUND);
        }

        return user;
    }

    async assignUserRoles(
        user_shop: UserShopEntity,
        roles: RoleEntity[]
    ): Promise<UserShopRoleEntity[]> {
        const user_shop_roles = roles.map((item) => {
            const role = new UserShopRoleEntity();
            role.role = item;
            role.user_shop = user_shop;
            return role;
        });
        return await this.userShopRoleRepo.save(user_shop_roles);
    }

    async dismissUserRoles(userShopRoles: string[]): Promise<string[]> {
        const toRemove = await Promise.all(
            userShopRoles.map((item) => this.getShopRoleById(item))
        );

        await this.userShopRoleRepo.softRemove(toRemove).catch(() => {
            throw new HttpException(
                "CANNOT_DISMISS_ROLE",
                HttpStatus.NOT_MODIFIED
            );
        });
        return userShopRoles;
    }

    async dismissAllRoleFrom(userId: string): Promise<UserShopRoleEntity[]> {
        const roles = await this.getUserRoles(userId);

        return await this.userShopRoleRepo.softRemove(roles);
    }

    async getUserRoles(userId: string): Promise<UserShopRoleEntity[]> {
        let roles: UserShopRoleEntity[];

        const filter: FindOneOptions<UserShopRoleEntity> = {};
        filter.where = { user_shop: { user: Equal(userId) } };
        filter.relations = {
            role: true,
            user_shop: true,
        };

        try {
            roles = await this.userShopRoleRepo.find(filter);
        } catch (error) {
            throw new HttpException("NOT_ROLE_FOUND", HttpStatus.NOT_FOUND);
        }

        return roles;
    }

    async getUserShop(userId: string): Promise<UserShopEntity> {
        let userShop: UserShopEntity;
        const filter: FindOneOptions<UserShopEntity> = {};
        filter.where = {
            user: Equal(userId),
        };
        filter.relations = {
            roles: { role: true },
            shop: true,
            user: true,
        };

        try {
            userShop = await this.userShopRepo.findOneOrFail(filter);
        } catch (error) {
            throw new HttpException("USER_SHOP_NOT_FOUND", HttpStatus.CONFLICT);
        }

        return userShop;
    }

    async findUser(payload: FindUserDto = {}): Promise<UserEntity[]> {
        let users: UserEntity[];
        const queryBuilder = this.userRepo
            .createQueryBuilder("user")
            // relation user -> user_shop
            .leftJoinAndSelect(
                "user.shops",
                "userShop",
                "user.id = userShop.user_id"
            )
            // relation user_shop -> user_shop_role
            .leftJoinAndSelect(
                "userShop.roles",
                "userShopRole",
                "userShop.id = userShopRole.user_shop_id"
            )
            // relation user_shop -> role
            .leftJoinAndSelect(
                "userShopRole.role",
                "role",
                "role.id = userShopRole.role_id"
            )
            // realtion user_shop -> shop
            .leftJoinAndSelect(
                "userShop.shop",
                "shop",
                "shop.id = userShop.shop_id"
            )
            .orderBy("user.updated_at", "ASC");

        if (!!payload.email)
            queryBuilder.where("user.email LIKE :email", {
                email: `${payload.email}`,
            });
        if (!!payload.names)
            queryBuilder.andWhere("user.names LIKE :names", {
                names: `%${payload.names}%`,
            });
        if (!!payload.username)
            queryBuilder.andWhere("user.username LIKE :username", {
                username: `%${payload.username}%`,
            });
        if (!!payload.type)
            queryBuilder.andWhere(
                `userShop.id ${
                    payload.type == "CLIENT" ? "IS NULL" : "IS NOT NULL"
                }`
            );

        if (!!payload.secret)
            queryBuilder.andWhere("user.secret = :secret", {
                secret: await this.hashSecret(payload.secret),
            });

        if (!!payload.user_id)
            queryBuilder.andWhere("user.id = :userId", {
                userId: payload.user_id,
            });

        if (!!payload.shop_id)
            queryBuilder.andWhere("shop.id = :shop_id", {
                shop_id: payload.shop_id,
            });
        if (payload.page && +payload.page >= 1) {
            queryBuilder.skip((+payload.page - 1) * 50);
            queryBuilder.take(50);
        }

        try {
            users = await queryBuilder.getMany();
        } catch (error) {
            throw new HttpException("USER_NOT_FOUND", HttpStatus.NOT_FOUND);
        }

        return users;
    }

    async getShopRoleById(shopRoleId: string) {
        const filter: FindOneOptions<UserShopRoleEntity> = {};
        filter.where = { id: shopRoleId };

        let shop_role: UserShopRoleEntity;

        try {
            shop_role = await this.userShopRoleRepo.findOneOrFail(filter);
        } catch (error) {
            throw new HttpException(
                "USER_ROLE_NOT_FOUND",
                HttpStatus.NOT_FOUND
            );
        }
        return shop_role;
    }

    async deleteUser(userId: string): Promise<string> {
        const user = await this.getUserById(userId);

        try {
            await this.userRepo.softRemove(user);
        } catch (error) {
            throw new HttpException(
                "USER_NOT_DELETED",
                HttpStatus.NOT_MODIFIED
            );
        }
        return userId;
    }

    async loadUserStat() {
        const stats = {
            total_user: await this.userRepo.count(),
        };
        return stats;
    }

    extractBasicCredential(authorization: string) {
        const basic = authorization.replace(/^Basic /, "");
        const [credential, psw] = Buffer.from(basic, "base64")
            .toString("utf-8")
            .split(":", 2);
        if (!credential || !psw)
            throw new HttpException("NO_CREDENTIAL", HttpStatus.BAD_REQUEST);

        return [credential, psw];
    }
}
