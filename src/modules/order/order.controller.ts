import {
    Body,
    Controller,
    HttpException,
    HttpStatus,
    Post,
    UseGuards,
} from "@nestjs/common";
import { OrderService } from "./order.service";
import { ResquestOrderDto } from "./order.dto";
import { CartService } from "../cart/cart.service";
import { ConfigService } from "@nestjs/config";
import { Stripe } from "stripe";
import { AuthGuard } from "../auth/auth.guard";
import { User, UserIdentity } from "../auth/auth.decorator";

@Controller("order")
export class OrderController {
    stripe: Stripe;
    REDIRECT_PAYMENT_SUCCESS: string;
    constructor(
        private orderService: OrderService,
        private cartService: CartService,
        configService: ConfigService
    ) {
        this.stripe = new Stripe(configService.get("STRIPE_SECRET"), {
            apiVersion: "2022-11-15",
            typescript: true,
        });
        this.REDIRECT_PAYMENT_SUCCESS = configService.get(
            "REDIRECT_PAYMENT_SUCCESS"
        );
    }

    @Post("request_payement")
    @UseGuards(AuthGuard)
    async RequestOrder(
        @Body() payload: ResquestOrderDto,
        @User() user: UserIdentity
    ): Promise<string> {
        const items = await Promise.all(
            payload.card_product_id.map((id) =>
                this.cartService.getFullItemById(id)
            )
        );

        if (items.some((item) => item.product.shop.id != payload.shop_id))
            throw new HttpException("PRODUCT_AND_SHOP", HttpStatus.CONFLICT);

        const parms: Stripe.Checkout.SessionCreateParams = {
            success_url: this.REDIRECT_PAYMENT_SUCCESS,
            cancel_url: this.REDIRECT_PAYMENT_SUCCESS,
            currency: "usd",
            client_reference_id: `${user.id} - ${user.username}`,
            line_items: items.map((item) => ({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: `${item.product.title}/${item.product_v.title}`,
                        description: item.product_v.description ?? undefined,
                        metadata: { item_id: item.id },
                    },
                    unit_amount: item.product_v.price * 100,
                },
                quantity: item.quantity,
            })),
            mode: "payment",
        };

        const session = await this.stripe.checkout.sessions.create(parms);

        return session.url;
    }
}
