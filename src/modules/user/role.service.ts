import { RoleInfo } from "@/index";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
    Equal,
    FindManyOptions,
    FindOneOptions,
    Like,
    Repository,
} from "typeorm";
import { RoleEntity, UserShopEntity, UserShopRoleEntity } from "./user.entity";
import { CreateRoleDto, UpdateRoleDto } from "./user.dto";

@Injectable()
class RoleService {
    pageSize = 20;

    constructor(
        @InjectRepository(RoleEntity)
        private readonly roleRepo: Repository<RoleEntity>,
        @InjectRepository(UserShopRoleEntity)
        private readonly userShopRepo: Repository<UserShopRoleEntity>
    ) {}

    async createRole(payload: CreateRoleDto): Promise<RoleEntity> {
        const role = new RoleEntity();

        role.title = payload.title;
        role.description = payload.description;

        try {
            await this.roleRepo.save(role);
        } catch (error) {
            throw new HttpException(
                "ROLE_REQUIREMENT_NOT_YET",
                HttpStatus.BAD_REQUEST
            );
        }

        return role;
    }

    async assignRoleTo(
        userShop: UserShopEntity,
        role: string | RoleEntity
    ): Promise<UserShopRoleEntity> {
        const userShopRole = new UserShopRoleEntity();

        if (typeof role == "string")
            userShopRole.role = await this.getRoleById(role);
        else userShopRole.role = role;

        userShopRole.user_shop = userShop;

        try {
            await this.userShopRepo.save(userShopRole);
        } catch (error) {
            throw new HttpException(
                "FAIL_TO_ASSIGN_ROLE_TO_USER",
                HttpStatus.CONFLICT
            );
        }

        return userShopRole;
    }

    async updateRole(
        payload: UpdateRoleDto,
        roleId: string
    ): Promise<RoleEntity> {
        const role = await this.getRoleById(roleId);
        role.description = payload.description ?? role.description;

        try {
            await this.roleRepo.save(role);
        } catch (error) {
            throw new HttpException(
                "ROLE_NOT_MODIFIED",
                HttpStatus.NOT_MODIFIED
            );
        }

        return role;
    }

    async getRoleById(id: string, loadRelation = false): Promise<RoleEntity> {
        let role: RoleEntity;

        const filter: FindOneOptions<RoleEntity> = {};
        filter.where = { id: Equal(id) };
        filter.select = {
            id: true,
            created_at: true,
            description: true,
            title: true,
        };
        filter.relations = {
            user_shops: loadRelation,
        };

        try {
            role = await this.roleRepo.findOneOrFail(filter);
        } catch (error) {
            throw new HttpException("ROLE_DOESNT_EXIST", HttpStatus.NOT_FOUND);
        }

        return role;
    }

    async getUserRoles(userId: string) {
        let roles: UserShopRoleEntity[];
        const filter: FindManyOptions<UserShopRoleEntity> = {};
        filter.where = {
            user_shop: { user: Equal(userId) },
        };
        filter.relations = {
            role: true,
            user_shop: true,
        };

        try {
            roles = await this.userShopRepo.find(filter);
        } catch (error) {
            throw new HttpException("ROLES_NOT_FOUND", HttpStatus.BAD_REQUEST);
        }

        return roles;
    }

    async findRoles(payload: RoleInfo = {}): Promise<RoleEntity[]> {
        let roles: RoleEntity[];

        const filter: FindManyOptions<RoleEntity> = {};
        filter.where = [
            { title: payload.title ?? undefined },
            { description: Like(`%${payload.description ?? ""}%`) },
        ];

        try {
            roles = await this.roleRepo.find(filter);
            if (roles.length == 0) throw new Error("EMPTY_TABLE");
        } catch (error) {
            throw new HttpException("ROLE_NOT_FOUND", HttpStatus.NOT_FOUND);
        }

        return roles;
    }

    async deleteRole(id: string): Promise<string> {
        const role = await this.getRoleById(id, true);

        try {
            await this.roleRepo.softRemove(role);
        } catch (error) {
            throw new HttpException(
                "ROLE_NOT_DELETED",
                HttpStatus.NOT_MODIFIED
            );
        }

        return id;
    }
}

export { RoleService };
