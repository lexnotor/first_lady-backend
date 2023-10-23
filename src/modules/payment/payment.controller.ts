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
        // on créer un objet stripe au lancement du serveur
        // il nous permettra de communiquer avec la platform stripe
        this.stripe = new Stripe(configService.get("STRIPE_SECRET"), {
            apiVersion: "2022-11-15",
            typescript: true,
        });
        // on recupere (dans les variable d'environement) aussi le lien
        // où rediriger après chaque paiement paiement effectué
        this.REDIRECT_PAYMENT_SUCCESS = configService.get(
            "REDIRECT_PAYMENT_SUCCESS"
        );
        // on recupere la API_SECRET de stripe
        this.STRIPE_WEBHOOK_SECRET = configService.get("STRIPE_WEBHOOK_SECRET");
    }

    // ce end-point sert à generer un lien de paiement sur la platform stripe
    @Post("request_payement")
    @UseGuards(AuthGuard)
    async RequestOrder(
        @Body() payload: ResquestOrderDto,
        @User() user: UserIdentity
    ): Promise<string> {
        // récuperation de données sur les produits à payer
        const items = await Promise.all(
            payload.card_product_id.map((id) =>
                this.cartService.getFullItemById(id)
            )
        );

        // si un produit n'appartient pas à la boutique
        if (items.some((item) => item.product.shop.id != payload.shop_id))
            throw new HttpException("PRODUCT_AND_SHOP", HttpStatus.CONFLICT);

        // les informations sur l'achat, necessaire pour le paiement avec Stripe
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
            metadata: {
                address: payload.address ?? "(Aucune addresse)",
            },
        };

        // on créer une instance de la session de paiement
        const session = await this.stripe.checkout.sessions.create(parms);

        // on demande à stripe de géenerer un lien pour ce paiment
        await this.paymentService.initPaiement(
            session.id,
            session,
            parms,
            user.id
        );

        // on return le lien à l'urilisateur
        return session.url;
    }

    // lorsqu'un paiement est effectué, stripe lance une requete vers notre serveurs
    // pour signaler le paiement, avec  toutes les informations de paiement
    @Post("webhook")
    @HttpCode(200)
    async SavePaiement(
        @Req() req: RawBodyRequest<Request>,
        @Headers("stripe-signature") sig: string
    ) {
        // la variable qui stocke l'evenement
        let event: Stripe.Event;
        // on recupere les données envoyée par stripe
        const payload_or = req.rawBody;

        try {
            // on demande une reference à l'evenement que stripe nous signale
            event = this.stripe.webhooks.constructEvent(
                payload_or,
                sig,
                this.STRIPE_WEBHOOK_SECRET
            );
        } catch (error) {
            return;
        }

        // si l'evenement correspond à un paiement effectué
        if (event.type == "checkout.session.completed") {
            // on demande à stripe les informations (les produits, l'utilisateur, ...) sur le paiement
            const allData = await this.stripe.checkout.sessions.retrieve(
                (event.data.object as Stripe.Checkout.Session).id,
                { expand: ["line_items.data.price.product"] }
            );
            // info: expand:[line_item.data.price.product] permet de preciser
            // que nous demandons tous les détails concernant les produits payer

            // recupérons l'id de la session
            const session_id = allData.id;

            // on confirme le paiement en l'enregitrent dans la base de données
            this.paymentService.confirmPaiement(session_id, allData);

            // on extraits la liste des id des produits payer
            // NB: ces id font reference à des produits dans le paniers
            const items_id = allData.line_items.data.map(
                (item) =>
                    (item.price.product as Stripe.Product).metadata.item_id
            );

            // on extraits aussi l'id de l'utilisateur ayant effectué l'achat
            const user_id = allData.client_reference_id;

            // à l'aide de l'objet eventEmitter, on emet un evenement de paiement
            // sur notre le serveur. cet evenement va tout simplement enregistrer
            // la commande dans la base de donnée
            this.eventEmitter.emit("order/new", {
                user_id,
                items_id,
                address: allData.metadata.address,
            });

            // il faut retourner une reponse à stripe !
            return true;
        }
    }

    // un end-point utilitaire pour recuperer les informations de paiement
    // de n'importe quel session stripe
    @Get(":id")
    async testStripe(@Param("id") id: string) {
        const allData = await this.stripe.checkout.sessions.retrieve(id, {
            expand: ["line_items.data.price.product"],
        });

        return allData;
    }
}
