import { Injectable, StreamableFile } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import puppeteer from "puppeteer";
import { Repository } from "typeorm";
import { OrderService } from "../order/order.service";
import { ProductVersionEntity } from "../product/product.entity";
import * as path from "path";
import * as ejs from "ejs";

@Injectable()
export class FactureService {
    constructor(
        private readonly orderService: OrderService,
        @InjectRepository(ProductVersionEntity)
        private productVersionRepo: Repository<ProductVersionEntity>
    ) {}

    async getPDFStream(html: string) {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setViewport({ height: 300, width: 200 });

        await page.setContent(html);

        const pdf = await page.pdf();

        await browser.close();

        return new StreamableFile(pdf);
    }

    async getOrderFacture(id: string) {
        const order = await this.orderService.getOrderById(id);

        const products = await this.orderService.getProductOrder(id);

        const html = ejs.renderFile(
            path.resolve("src/modules/facture/facture.template.ejs"),
            {
                order,
                products,
            }
        );

        return html;
    }
}
