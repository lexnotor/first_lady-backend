import {
    Body,
    Controller,
    Get,
    Headers,
    HttpCode,
    HttpException,
    HttpStatus,
    Param,
    Post,
    RawBodyRequest,
    Req,
    UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { Stripe } from "stripe";
import { User, UserIdentity } from "../auth/auth.decorator";
import { AuthGuard } from "../auth/auth.guard";
import { CartService } from "../cart/cart.service";
import { ResquestOrderDto } from "../order/order.dto";
import { PaymentService } from "./payment.service";

@Controller("payment")
export class PaymentController {
    stripe: Stripe;
    REDIRECT_PAYMENT_SUCCESS: string;
    STRIPE_WEBHOOK_SECRET: string;

    constructor(
        private paymentService: PaymentService,
        private cartService: CartService,
        configService: ConfigService,
        private readonly eventEmitter: EventEmitter2
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
            client_reference_id: `${user.id}`,
            line_items: items.map((item) => ({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: `${item.product.title}/${item.product_v.title}`,
                        description: item.product_v.description ?? undefined,
                        metadata: { item_id: item.id, shop_id: item.shop.id },
                    },
                    unit_amount: item.product_v.price * 100,
                },
                quantity: item.quantity,
            })),
            mode: "payment",
        };

        const session = await this.stripe.checkout.sessions.create(parms);

        await this.paymentService.initPaiement(
            session.id,
            session,
            parms,
            user.id
        );

        return session.url;
    }

    @Post("webhook")
    @HttpCode(200)
    async SavePaiement(
        @Req() req: RawBodyRequest<Request>,
        @Headers("stripe-signature") sig: string
    ) {
        let event: Stripe.Event;
        const payload_or = req.rawBody;

        try {
            event = this.stripe.webhooks.constructEvent(
                payload_or,
                sig,
                this.STRIPE_WEBHOOK_SECRET
            );
        } catch (error) {
            return;
        }

        if (event.type == "checkout.session.completed") {
            const allData = await this.stripe.checkout.sessions.retrieve(
                (event.data.object as Stripe.Checkout.Session).id,
                { expand: ["line_items.data.price.product"] }
            );
            const session_id = allData.id;

            this.paymentService.confirmPaiement(session_id, allData);

            const items_id = allData.line_items.data.map(
                (item) =>
                    (item.price.product as Stripe.Product).metadata.item_id
            );

            const user_id = allData.client_reference_id;

            this.eventEmitter.emit("order/new", { user_id, items_id });

            return true;
        }
    }

    @Get(":id")
    async testStripe(@Param("id") id: string) {
        const allData = await this.stripe.checkout.sessions.retrieve(id, {
            expand: ["line_items.data.price.product"],
        });

        return allData;
    }
}
