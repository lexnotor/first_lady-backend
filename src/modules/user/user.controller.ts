import { ApiResponse, RoleInfo, UserInfo } from "@/index";
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from "@nestjs/common";
import { HasRole, User, UserIdentity } from "../auth/auth.decorator";
import { AuthGuard } from "../auth/auth.guard";
import { RoleService } from "./role.service";
import {
    AssignRoleDto,
    CreateRoleDto,
    CreateUserDto,
    DismissRoleDto,
    FindUserDto,
    UpdateUserDto,
} from "./user.dto";
import {
    RoleEntity,
    RoleType,
    UserEntity,
    UserShopRoleEntity,
} from "./user.entity";
import { UserService } from "./user.service";
import { ShopService } from "../shop/shop.service";

@Controller("user")
export class UserController {
    constructor(
        private readonly roleService: RoleService,
        private readonly userService: UserService,
        private readonly shopService: ShopService
    ) {}

    @Post("role/new")
    @UseGuards(AuthGuard)
    @HasRole(RoleType.OWNER)
    async createRole(
        @Body() payload: CreateRoleDto
    ): Promise<ApiResponse<RoleEntity>> {
        return {
            message: "ROLE_CREATED",
            data: await this.roleService.createRole(payload),
        };
    }

    @Post("new")
    @HasRole(RoleType.UPDATE_USER)
    @UseGuards(AuthGuard)
    async createUser(
        @Body() payload: CreateUserDto,
        @User() userAuth: UserIdentity
    ): Promise<ApiResponse<UserEntity>> {
        const staff = await this.userService.createUser(payload);
        const shop = await this.shopService.getShopById(userAuth.shop);

        await this.userService.addUserToShop(shop, staff);

        return {
            message: "USER_CREATED",
            data: await this.userService.getUserById(staff.id),
        };
    }

    @Put("role")
    @HasRole(RoleType.UPDATE_USER)
    @UseGuards(AuthGuard)
    async assignRole(
        @Body() payload: AssignRoleDto
    ): Promise<ApiResponse<UserShopRoleEntity[]>> {
        const user_shop = await this.userService.getUserShop(payload.user_id);

        await this.userService.dismissAllRoleFrom(payload.user_id);

        const roles = await Promise.all(
            payload.roles.map(async (item) =>
                this.roleService.getRoleById(item)
            )
        );
        await this.userService.assignUserRoles(user_shop, roles);

        const newRoles = await this.roleService.getUserRoles(payload.user_id);

        // console.log(newRoles);
        return {
            message: "ROLE_SET",
            data: newRoles,
        };
    }

    @Delete("role")
    @UseGuards(AuthGuard)
    @HasRole(RoleType.UPDATE_USER)
    async dismissRole(
        @Query() payload: DismissRoleDto
    ): Promise<ApiResponse<UserShopRoleEntity[]>> {
        const user_shop = await this.userService.getUserShop(payload.user_id);

        const roles = await Promise.all(
            payload.roles.map(async (item) =>
                this.roleService.getRoleById(item)
            )
        );

        return {
            message: "ROLE_DELETED",
            data: await this.userService.assignUserRoles(user_shop, roles),
        };
    }

    @Get("role/find")
    @UseGuards(AuthGuard)
    @HasRole(RoleType.STAFF)
    async getAllRole(): Promise<ApiResponse<RoleInfo[]>> {
        const roles = await this.roleService.findRoles();
        return {
            message: "ROLE_SEARCH_RESULT",
            data: roles,
        };
    }

    @Put("update")
    @UseGuards(AuthGuard)
    @HasRole(RoleType.UPDATE_USER)
    async updateUser(
        @Body() payload: UpdateUserDto
    ): Promise<ApiResponse<UserInfo>> {
        const user = await this.userService.updateUser(payload, payload.userId);
        return {
            message: "UPDATE_USER",
            data: await this.userService.getUserById(user.id),
        };
    }

    @Get("find")
    @HasRole(RoleType.STAFF)
    @UseGuards(AuthGuard)
    async findUser(
        @Query() search: FindUserDto
    ): Promise<ApiResponse<UserEntity | UserEntity[]>> {
        const user = search?.user_id
            ? await this.userService.getUserById(search.user_id)
            : await this.userService.findUser(search);

        return {
            message: "SEARCH_RESULT",
            data: user,
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
        @User() userAuth: UserIdentity,
        @Body() payload: UpdateUserDto
    ): Promise<ApiResponse<UserEntity>> {
        if (!!payload.secret) {
            const users = await this.userService.findUser({
                user_id: userAuth.id,
                secret: payload.secret,
            });
            if (users.length == 0)
                throw new HttpException(
                    "INCORRECT_PASSWORD",
                    HttpStatus.CONFLICT
                );
        } else payload.secret = undefined;

        const user = await this.userService.updateUser(payload, userAuth.id);

        return {
            message: "UPDATE_USER",
            data: await this.userService.getUserById(user.id),
        };
    }

    @Get("stats")
    @UseGuards(AuthGuard)
    @HasRole(RoleType.STAFF)
    async loadUserStats(): Promise<ApiResponse> {
        return {
            message: "USER_STATS",
            data: await this.userService.loadUserStat(),
        };
    }

    @Delete("delete/:userId")
    @UseGuards(AuthGuard)
    @HasRole(RoleType.UPDATE_USER)
    async deleteUser(
        @Param("userId") userId: string
    ): Promise<ApiResponse<string>> {
        return {
            message: "DELETE_USER",
            data: await this.userService.deleteUser(userId),
        };
    }
}
