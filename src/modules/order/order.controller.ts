import { Controller, HttpCode } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { CartService } from "../cart/cart.service";
import { UserService } from "../user/user.service";
import { OrderService } from "./order.service";

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
}
