import { ApiResponse } from "@/index";
import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { User, UserIdentity } from "../auth/auth.decorator";
import { AuthGuard } from "../auth/auth.guard";
import { ProductService } from "../product/product.service";
import { ProductVersionService } from "../product/productVersion.service";
import { UserService } from "../user/user.service";
import { AddItemDto } from "./cart.dto";
import { CartEntity, CartProductEntity } from "./cart.entity";
import { CartService } from "./cart.service";

@Controller("cart")
export class CartController {
    constructor(
        private readonly cartService: CartService,
        private readonly userService: UserService,
        private readonly productService: ProductService,
        private readonly productVersionService: ProductVersionService
    ) {}

    @OnEvent("create_cart")
    async createCart(userId: string) {
        let cart: CartEntity;
        try {
            cart = await this.cartService.getUserCart(userId);
        } catch (error) {
            const user = await this.userService.getUserById(userId);
            cart = await this.cartService.createCart(user);
        }
        return await this.cartService.getCartById(cart.id);
    }

    @Post("item/add")
    @UseGuards(AuthGuard)
    async addItem(
        @User() user: UserIdentity,
        @Body() payload: AddItemDto
    ): Promise<ApiResponse<CartProductEntity>> {
        let cart: CartEntity;
        try {
            cart = await this.cartService.getUserCart(user.id);
        } catch (error) {
            cart = await this.createCart(user.id);
        }

        const product_v =
            await this.productVersionService.getProductVersionById(
                payload.product_v
            );

        const item = await this.cartService.addItem(
            { quantity: payload.quantity },
            cart,
            product_v
        );

        return {
            message: "ITEM_ADDED",
            data: await this.cartService.getItemById(item.id),
        };
    }

    @Get("item/mine")
    @UseGuards(AuthGuard)
    async getMyItem(
        @User() user: UserIdentity
    ): Promise<ApiResponse<CartProductEntity[]>> {
        const cart = await this.cartService.getUserCart(user.id);
        const items = await this.cartService.getCartItems(cart.id);

        return {
            message: "USER_CART",
            data: items,
        };
    }
}
