import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Equal, FindOneOptions, Repository } from "typeorm";
import { ShopEntity } from "../shop/shop.entity";
import { CreateUserDto, UpdateUserDto } from "./user.dto";
import { UserEntity, UserShopEntity } from "./user.entity";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        @InjectRepository(UserShopEntity)
        private readonly userShopRepo: Repository<UserShopEntity>
    ) {}

    hashPwd(secret: string): string {
        return secret;
    }

    async createUser(payload: CreateUserDto): Promise<UserEntity> {
        const user = new UserEntity();
        // required
        user.username = payload.username;
        user.secret = this.hashPwd(payload.secret);
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

        return user;
    }

    async addUserToShop(
        shop: ShopEntity,
        user: string | UserEntity
    ): Promise<UserShopEntity> {
        const userShop = new UserShopEntity();

        userShop.shop = shop;

        if (typeof user == "string")
            userShop.user = await this.getUserById(user);
        else userShop.user = user;

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
        filter.select = {
            id: true,
            username: true,
            names: true,
            address: true,
            created_at: true,
            bank: true,
            birth: true,
            email: true,
            shops: true,
        };

        filter.relations = { shops: true };

        try {
            user = await this.userRepo.findOneOrFail(filter);
        } catch (error) {
            throw new HttpException("USER_DOESNT_EXIST", HttpStatus.NOT_FOUND);
        }

        return user;
    }

    async getUserRoles(userId: string): Promise<UserEntity> {
        let user: UserEntity;

        const filter: FindOneOptions<UserEntity> = {};
        filter.where = { id: Equal(userId) };
        filter.relations = {
            shops: { roles: true, shop: true },
        };
        filter.select = { id: true };

        try {
            user = await this.userRepo.findOneOrFail(filter);
        } catch (error) {
            throw new HttpException("USER_NOT_EXIST", HttpStatus.NOT_FOUND);
        }

        return user;
    }

    async getUserShop(userId: string): Promise<UserShopEntity[]> {
        let userShop: UserShopEntity[];
        const filter: FindOneOptions<UserEntity> = {};
        filter.select = { id: true, shops: true };

        filter.relations = {
            shops: { shop: true, roles: { role: true } },
        };

        filter.where = {
            id: Equal(userId),
        };

        try {
            const user = await this.userRepo.findOneOrFail(filter);
            userShop = user.shops;
        } catch (error) {
            throw new HttpException("USER_NOT_FOUND", HttpStatus.CONFLICT);
        }

        return userShop;
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
}
