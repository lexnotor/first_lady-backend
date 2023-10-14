import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { User, UserIdentity } from "../auth/auth.decorator";
import { AuthGuard } from "../auth/auth.guard";
import { RoleService } from "../user/role.service";
import { UserService } from "../user/user.service";
import { CreateShopDto } from "./shop.dto";
import { ShopEntity } from "./shop.entity";
import { ShopService } from "./shop.service";
import { ApiResponse } from "@/index";
import { RoleType } from "../user/user.entity";

@Controller("shop")
export class ShopController {
    constructor(
        private readonly shopService: ShopService,
        private readonly userService: UserService,
        private readonly roleService: RoleService
    ) {}

    // cet endpoint permet de créer une boutique
    @UseGuards(AuthGuard)
    @Post("new")
    async createShop(
        @Body() payload: CreateShopDto,
        @User() user: UserIdentity
    ): Promise<ShopEntity> {
        // on cree la boutique
        const shop = await this.shopService.createShop(payload);

        // on ajouter l'utilisateur à la boutique
        const userShop = await this.userService.addUserToShop(shop, user.id);

        // on assigne l'utilisateur comme un proprietaire
        const [role] = await this.roleService.findRoles({
            title: RoleType.OWNER,
        });
        await this.roleService.assignRoleTo(userShop, role);

        return shop;
    }

    // cet endpoint permet
    @Get()
    async findShop(
        @Query("text") text: string
    ): Promise<ApiResponse<ShopEntity[]>> {
        return {
            message: "SHOP_FOUND",
            data: await this.shopService.findShop(text),
        };
    }

    // cet endpoint renvoi des statisques
    @Get()
    async loadShopStats(): Promise<ApiResponse> {
        return {
            message: "",
            data: this.shopService.loadShopStat(),
        };
    }
}
