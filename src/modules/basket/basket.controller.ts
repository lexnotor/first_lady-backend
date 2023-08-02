import {
    Body,
    Controller,
    Get,
    HttpException,
    HttpStatus,
    Post,
    UseGuards,
} from "@nestjs/common";
import { BasketService } from "./basket.service";
import { AuthGuard } from "../auth/auth.guard";
import { UserService } from "../user/user.service";
import { User, UserIdentity } from "../auth/auth.decorator";
import { BasketEntity, BasketProductEntity } from "./basket.entity";
import { ProductService } from "../product/product.service";
import { AddItemDto } from "./basket.dto";

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
            basket = await this.basketService.getUserBasket(token.id);
        } catch (error) {
            const user = await this.userService.getUserById(token.id);
            basket = await this.basketService.createBasket(user);
        }
        return await this.basketService.getBasketById(basket.id);
    }

    @Post("item/add")
    @UseGuards(AuthGuard)
    async addItem(
        @User() user: UserIdentity,
        @Body() payload: AddItemDto
    ): Promise<BasketProductEntity> {
        let item: BasketProductEntity;
        const cart = await this.basketService.getUserBasket(user.id);

        const product_v = await this.productService.getProductVersionById(
            payload.product_v
        );

        try {
            item = await this.basketService.addItem(
                { quantity: payload.quantity },
                cart,
                product_v
            );
        } catch (error) {
            throw new HttpException(
                "ITEM_REQUIMENT_FAIL",
                HttpStatus.BAD_REQUEST
            );
        }

        return await this.basketService.getItemById(item.id);
    }
}
