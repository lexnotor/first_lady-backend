import { Injectable, OnModuleDestroy, StreamableFile } from "@nestjs/common";
import * as ejs from "ejs";
import * as path from "path";
import puppeteer, { Browser } from "puppeteer";
import { OrderService } from "../order/order.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class FactureService implements OnModuleDestroy {
    isInProduction: boolean;
    browser: Browser;
    constructor(
        private readonly orderService: OrderService,
        private readonly configService: ConfigService
    ) {
        this.isInProduction =
            this.configService.get<string>("NODE_ENV") == "production";
        this.initBrowser();
    }

    async initBrowser() {
        if (this.isInProduction) return;

        this.browser = await puppeteer.launch({ headless: "new" });
    }

    async getPDFStream(html: string) {
        const page = await this.browser.newPage();

        await page.setContent(html);

        const pdf = await page.pdf({ width: 500, height: 700 });

        page.close();

        return new StreamableFile(pdf, { type: "application/pdf" });
    }

    async onModuleDestroy() {
        this.browser && (await this.browser.close());
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

        return this.isInProduction ? html : await this.getPDFStream(html);
    }
}
