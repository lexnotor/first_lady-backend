import { Controller, HttpCode } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OnEvent } from "@nestjs/event-emitter";
import { Stripe } from "stripe";
import { CartService } from "../cart/cart.service";
import { UserService } from "../user/user.service";
import { OrderService } from "./order.service";

@Controller("order")
export class OrderController {
    stripe: Stripe;
    REDIRECT_PAYMENT_SUCCESS: string;
    STRIPE_WEBHOOK_SECRET: string;
    constructor(
        private orderService: OrderService,
        private cartService: CartService,
        private userSerivce: UserService,
        configService: ConfigService
    ) {
        this.stripe = new Stripe(configService.get("STRIPE_SECRET"), {
            apiVersion: "2022-11-15",
            typescript: true,
        });
        this.REDIRECT_PAYMENT_SUCCESS = configService.get(
            "REDIRECT_PAYMENT_SUCCESS"
        );
        this.STRIPE_WEBHOOK_SECRET = configService.get("STRIPE_WEBHOOK_SECRET");
    }

    @OnEvent("order/new")
    @HttpCode(200)
    async SavePaiement({
        items_id,
        user_id,
    }: {
        user_id: string;
        items_id: string[];
    }) {
        const items = await Promise.all(
            items_id.map((item) => this.cartService.getFullItemById(item))
        );

        const shop = items[0].shop;
        const user = await this.userSerivce.getUserById(user_id);

        this.orderService.addOrder(user, undefined, shop, ...items);

        return true;
    }
}
