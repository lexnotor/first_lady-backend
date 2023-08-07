import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Post,
} from "@nestjs/common";
import { OrderService } from "./order.service";
import { ResquestOrderDto } from "./order.dto";
import { CartService } from "../cart/cart.service";

@Controller("order")
export class OrderController {
    constructor(
        private orderService: OrderService,
        private cartService: CartService
    ) {}

    @Post("request_payement")
    async RequestOrder(@Body() payload: ResquestOrderDto) {
        const items = await Promise.all(
            payload.card_product_id.map((id) =>
                this.cartService.getItemById(id)
            )
        );
        if (items.some((item) => item.product.shop.id != payload.shop_id))
            throw new HttpException("PRODUCT_AND_SHOP", HttpStatus.CONFLICT);

        return null;
    }
}
