import { Injectable, StreamableFile } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import puppeteer, { Browser } from "puppeteer";
import { Repository } from "typeorm";
import { OrderService } from "../order/order.service";
import { ProductVersionEntity } from "../product/product.entity";
import * as path from "path";
import * as ejs from "ejs";

@Injectable()
export class FactureService {
    browser: Browser;
    constructor(
        private readonly orderService: OrderService,
        @InjectRepository(ProductVersionEntity)
        private productVersionRepo: Repository<ProductVersionEntity>
    ) {
        this.initBrowser();
    }

    private async initBrowser() {
        this.browser = await puppeteer.launch({ headless: "new" });
    }

    async getPDFStream(html: string) {
        const page = await this.browser.newPage();

        await page.setContent(html);

        const pdf = await page.pdf({ width: 500, height: 700 });

        page.close();

        return new StreamableFile(pdf, { type: "application/pdf" });
    }

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

        return await this.getPDFStream(html);
    }
}
