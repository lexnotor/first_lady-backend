import { ApiResponse } from "@/index";
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { HasRole, User, UserIdentity } from "../auth/auth.decorator";
import { AuthGuard } from "../auth/auth.guard";
import { CartService } from "../cart/cart.service";
import { UserService } from "../user/user.service";
import { FindOrderQueryDto, SaveLocalOrderDto } from "./order.dto";
import { OrderEntity, OrderState, OrderType } from "./order.entity";
import { OrderService } from "./order.service";
import { ProductVersionService } from "../product/productVersion.service";

@Controller("order")
export class OrderController {
    // Dans ce controller on aura besoin des services
    //      OrderService => pour gèrer les commandes
    //      CartService => pour gèrer les pagnier
    //      UserService => pour recuperer les utilisateurs dans la BD
    constructor(
        private orderService: OrderService,
        private cartService: CartService,
        private userSerivce: UserService,
        private productVSerivce: ProductVersionService
    ) {}

    // recupere l'evenement emit sur le serveur, après chaque paiement
    @OnEvent("order/new")
    @HttpCode(200)
    async saveOrder({
        items_id,
        user_id,
    }: {
        user_id: string;
        items_id: string[];
    }) {
        // on recupere tous les produits payés
        const items = await Promise.all(
            items_id.map((item) => this.cartService.getFullItemById(item))
        );

        // on extrait l'id de la boutique
        const shop = items[0].shop;
        // on extrait l'id du client
        const user = await this.userSerivce.getUserById(user_id);

        // on enregistre la commande dans la base de données
        await this.orderService.addOrder(user, undefined, shop, ...items);

        // on efface ensuite elements dans le pagnier
        // et on reduit la quantité
        await Promise.all(
            items.map(async (item) => {
                await this.productVSerivce.decreaseQuantity(
                    item?.product_v?.id,
                    item?.quantity
                );
                return this.cartService.deleteItem(item.id);
            })
        );

        return true;
    }

    // cet endpoint permet d'enregistrer les achats effectué directement dans la boutique
    // similaire à saveOrder
    @Post("local")
    @UseGuards(AuthGuard)
    @HasRole("OWNER")
    async saveLocalOrder(
        @Body() payload: SaveLocalOrderDto,
        @User() { id: UserId }: UserIdentity
    ): Promise<ApiResponse<OrderEntity>> {
        const items = await Promise.all(
            payload.items_id.map((item) =>
                this.cartService.getFullItemById(item)
            )
        );

        const shop = items[0].shop;
        const user = await this.userSerivce.getUserById(UserId);

        let order = await this.orderService.addOrder(
            user,
            OrderType.INSITU,
            shop,
            ...items
        );

        await Promise.all(
            items.map(async (item) => {
                await this.productVSerivce.decreaseQuantity(
                    item?.product_v?.id,
                    item?.quantity
                );
                return this.cartService.deleteItem(item.id);
            })
        );

        order = await this.orderService.changeOrderStatus(
            order.id,
            OrderState.DONE
        );

        return {
            message: "ORDER_ADDED",
            data: order,
        };
    }

    // cet endpoint permet de recuperer la liste de commande effectué par
    // un utilisateur connecté (admin ou client)
    @Get("mine")
    @UseGuards(AuthGuard)
    async getMyOrder(
        @User() user: UserIdentity
    ): Promise<ApiResponse<OrderEntity[]>> {
        return {
            message: "FIND_USER_ORDERS",
            data: await this.orderService.getUserOrders(user.id),
        };
    }

    // cet endpoint permet de recuperer un resumé des commandes enregistré
    @Get("stats")
    async getOrderStats(@Query("year") year: number): Promise<ApiResponse> {
        return {
            message: "ORDER_STATS",
            data: await this.orderService.loadProductStat(year),
        };
    }

    // TODO add guard
    // cet endoint permet de recuperer une commande precisée par son id
    @Get("one/:orderId")
    async getOneOrder(
        @Param("orderId") orderId: string
    ): Promise<ApiResponse<OrderEntity>> {
        return {
            message: "ORDER_FOUND",
            data: await this.orderService.getOrderById(orderId, true),
        };
    }

    // cet endpoint permet de chercher des commandes dans la base de données
    // les filtres de recherche sont dans FindOrderQueryDto
    @Get()
    @HasRole("OWNER")
    @UseGuards(AuthGuard)
    async findOrders(
        @Query() query: FindOrderQueryDto
    ): Promise<ApiResponse<OrderEntity | OrderEntity[]>> {
        // en cas de filtrer par date, on verifie le format
        if (!query.isValideDate())
            throw new HttpException(
                "INVALIDE_DATE_PROVIDED",
                HttpStatus.BAD_REQUEST
            );

        return {
            message: "ORDERS_FOUND",
            data:
                query.end || query.begin || query.state || query.type
                    ? await this.orderService.findOrders(query)
                    : await this.orderService.getOrderAllOrders(),
        };
    }

    // cet endpoint permet d'annuler une commande
    @Put("cancel/:id")
    @UseGuards(AuthGuard)
    async cancelOrder(
        @Param() orderId: string
    ): Promise<ApiResponse<OrderEntity>> {
        return {
            message: "ORDERS_CANCEL",
            data: await this.orderService.changeOrderStatus(
                orderId,
                OrderState.ERROR
            ),
        };
    }
    // cet endpoint permet de marquer terminer, une commande
    @Put("done/:id")
    @UseGuards(AuthGuard)
    async finishOrder(
        @Param() orderId: string
    ): Promise<ApiResponse<OrderEntity>> {
        return {
            message: "ORDERS_DONE",
            data: await this.orderService.changeOrderStatus(
                orderId,
                OrderState.DONE
            ),
        };
    }

    // cet endpoint permet de supprimer une commande dans la base données
    @Delete(":id")
    @UseGuards(AuthGuard)
    async deleteOrder(
        @Param("id") orderId: string,
        @User() user: UserIdentity
    ): Promise<ApiResponse<string>> {
        // on recupere la commande dans la base de données
        const order = await this.orderService.getOrderById(orderId);
        // on verifie qu'elle appartient à l'utilisateur connectée
        if (order.user.id != user.id)
            throw new HttpException("NOT_YOUR_ORDER", HttpStatus.CONFLICT);

        // ensuite on la supprime
        return {
            message: "ORDER_DELETED",
            data: await this.orderService.deleteOrder(order.id),
        };
    }
}
