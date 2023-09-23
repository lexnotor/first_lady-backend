import { Body, Controller, Get, Post, Put, UseGuards } from "@nestjs/common";
import { RoleService } from "./role.service";
import { CreateRoleDto, UpdateUserDto } from "./user.dto";
import { RoleEntity, UserEntity } from "./user.entity";
import { ApiResponse } from "@/index";
import { UserService } from "./user.service";
import { AuthGuard } from "../auth/auth.guard";
import { User, UserIdentity } from "../auth/auth.decorator";

@Controller("user")
export class UserController {
    constructor(
        private readonly roleService: RoleService,
        private readonly userService: UserService
    ) {}

    @Post("role/new")
    async createRole(
        @Body() payload: CreateRoleDto
    ): Promise<ApiResponse<RoleEntity>> {
        return {
            message: "ROLE_CREATED",
            data: await this.roleService.createRole(payload),
        };
    }

    @Get("me")
    @UseGuards(AuthGuard)
    async getMe(@User() user: UserIdentity): Promise<ApiResponse<UserEntity>> {
        return {
            message: "YOUR_ARE_LOGIN",
            data: await this.userService.getUserById(user.id),
        };
    }

    @Put("me")
    @UseGuards(AuthGuard)
    async updateMe(
        @User() user: UserIdentity,
        @Body() payload: UpdateUserDto
    ): Promise<ApiResponse<UserEntity>> {
        return {
            message: "USER_UPDATED",
            data: await this.userService.updateUser(payload, user.id),
        };
    }

    @Get("stats")
    async loadUserStats(): Promise<ApiResponse> {
        return {
            message: "USER_STATS",
            data: await this.userService.loadUserStat(),
        };
    }
}
