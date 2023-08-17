import { Injectable } from "@nestjs/common";
import * as ejs from "ejs";
import * as path from "path";
import { OrderService } from "../order/order.service";

@Injectable()
export class FactureService {
    constructor(private readonly orderService: OrderService) {}

    async getOrderFacture(id: string) {
        const order = await this.orderService.getOrderById(id);

        const products = await this.orderService.getProductOrder(id);

        const html = await ejs.renderFile(
            path.resolve("src/modules/facture/facture.template.ejs"),
            {
                order,
                products,
            }
        );

        return html;
    }
}
