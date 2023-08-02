import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { User, UserIdentity } from "../auth/auth.decorator";
import { AuthGuard } from "../auth/auth.guard";
import { ProductService } from "../product/product.service";
import { UserService } from "../user/user.service";
import { AddItemDto } from "./basket.dto";
import { BasketEntity, BasketProductEntity } from "./basket.entity";
import { BasketService } from "./basket.service";

@Controller("basket")
export class BasketController {
    constructor(
        private readonly basketService: BasketService,
        private readonly userService: UserService,
        private readonly productService: ProductService
    ) {}

    @Post("create")
    @UseGuards(AuthGuard)
    async createBasket(@User() token: UserIdentity) {
        let basket: BasketEntity;
        try {
            basket = await this.basketService.getUserCart(token.id);
        } catch (error) {
            const user = await this.userService.getUserById(token.id);
            basket = await this.basketService.createBasket(user);
        }
        return await this.basketService.getCartById(basket.id);
    }

    @Post("item/add")
    @UseGuards(AuthGuard)
    async addItem(
        @User() user: UserIdentity,
        @Body() payload: AddItemDto
    ): Promise<BasketProductEntity> {
        const cart = await this.basketService.getUserCart(user.id);

        const product_v = await this.productService.getProductVersionById(
            payload.product_v
        );

        const item = await this.basketService.addItem(
            { quantity: payload.quantity },
            cart,
            product_v
        );

        return await this.basketService.getItemById(item.id);
    }

    @Get("item")
    @UseGuards(AuthGuard)
    async getMyItem(
        @User() user: UserIdentity
    ): Promise<BasketProductEntity[]> {
        const cart = await this.basketService.getUserCart(user.id);
        const items = await this.basketService.getCartItems(cart.id);

        return items;
    }
}
