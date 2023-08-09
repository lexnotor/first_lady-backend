import {
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpException,
    HttpStatus,
    Param,
    UseGuards,
} from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { CartService } from "../cart/cart.service";
import { UserService } from "../user/user.service";
import { OrderService } from "./order.service";
import { AuthGuard } from "../auth/auth.guard";
import { User, UserIdentity } from "../auth/auth.decorator";
import { ApiResponse } from "@/index";
import { OrderEntity } from "./order.entity";

@Controller("order")
export class OrderController {
    constructor(
        private orderService: OrderService,
        private cartService: CartService,
        private userSerivce: UserService
    ) {}

    @OnEvent("order/new")
    @HttpCode(200)
    async saveOrder({
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

        await this.orderService.addOrder(user, undefined, shop, ...items);

        await Promise.all(
            items.map((item) => this.cartService.deleteItem(item.id))
        );

        return true;
    }

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

    @Delete(":id")
    @UseGuards(AuthGuard)
    async deleteOrder(
        @Param("id") orderId: string,
        @User() user: UserIdentity
    ): Promise<ApiResponse<string>> {
        const order = await this.orderService.getOrderById(orderId);

        if (order.user.id != user.id)
            throw new HttpException("NOT_YOUR_ORDER", HttpStatus.CONFLICT);

        return {
            message: "ORDER_DELETED",
            data: await this.orderService.deleteOrder(order.id),
        };
    }
}
