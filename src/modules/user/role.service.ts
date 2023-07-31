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
import { RoleEntity } from "./user.entity";

@Injectable()
class RoleService {
    pageSize = 20;

    constructor(
        @InjectRepository(RoleEntity)
        private readonly roleRepo: Repository<RoleEntity>
    ) {}

    async createRole(payload: RoleInfo): Promise<RoleEntity> {
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

    async updateRole(payload: RoleInfo): Promise<RoleEntity> {
        const role = await this.getRoleById(payload.id);
        role.description = payload.description ?? role.description;
        role.title = payload.title ?? role.title;

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

    async findRoles(payload: RoleInfo, page = 1): Promise<RoleEntity[]> {
        let roles: RoleEntity[];

        const filter: FindManyOptions<RoleEntity> = {};
        filter.where = [
            { title: Like(`%${payload.title ?? ""}%`) },
            { description: Like(`%${payload.description ?? ""}%`) },
        ];
        filter.select = {
            id: true,
            created_at: true,
            description: true,
            title: true,
        };
        filter.skip = (page - 1) * this.pageSize;
        filter.take = this.pageSize;

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
