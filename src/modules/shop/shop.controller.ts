import { Controller, Post, UseGuards } from "@nestjs/common";
import { User, UserIdentity } from "../auth/auth.decorator";
import { AuthGuard } from "../auth/auth.guard";
import { RoleService } from "../user/role.service";
import { UserService } from "../user/user.service";
import { CreateShopDto } from "./shop.dto";
import { ShopEntity } from "./shop.entity";
import { ShopService } from "./shop.service";

@Controller("shop")
export class ShopController {
    constructor(
        private readonly shopService: ShopService,
        private readonly userService: UserService,
        private readonly roleService: RoleService
    ) {}

    @UseGuards(AuthGuard)
    @Post("new")
    async createShop(
        payload: CreateShopDto,
        @User() user: UserIdentity
    ): Promise<ShopEntity> {
        // create shop
        const shop = await this.shopService.createShop(payload);

        // add user
        const userShop = await this.userService.addUserToShop(shop, user.id);

        // assign user as owner
        const [role] = await this.roleService.findRoles({ title: "OWNER" });
        const userShopRole = await this.roleService.assignRoleTo(
            userShop,
            role
        );
        console.log(userShopRole);

        return shop;
    }
}
