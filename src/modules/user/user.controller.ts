import { Body, Controller, Post } from "@nestjs/common";
import { RoleService } from "./role.service";
import { CreateRoleDto } from "./user.dto";
import { RoleEntity } from "./user.entity";

@Controller("user")
export class UserController {
    constructor(private readonly roleService: RoleService) {}

    @Post("role/new")
    async createRole(@Body() payload: CreateRoleDto): Promise<RoleEntity> {
        return await this.roleService.createRole(payload);
    }
}
