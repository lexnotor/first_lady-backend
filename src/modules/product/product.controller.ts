import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { ShopService } from "../shop/shop.service";
import { CreateProductDto } from "./product.dto";
import { ProductEntity } from "./product.entity";
import { ProductService } from "./product.service";

@Controller("product")
export class ProductController {
    constructor(
        private readonly productService: ProductService,
        private readonly shopService: ShopService
    ) {}

    @Post("new")
    @UseGuards(AuthGuard)
    async createProduct(
        @Body() payload: CreateProductDto
    ): Promise<ProductEntity> {
        const product_ = payload.getProduct(),
            product_v = payload.getProduct_v(),
            categoryId = payload.getCategoryId(),
            shopId = payload.getShopId();

        // find category
        const category = await this.productService.getCategoryById(categoryId);

        // found shop
        const shop = await this.shopService.getShopById(shopId);

        // create product
        const product = await this.productService.createProduct(
            product_,
            shop,
            category
        );

        // create version
        await this.productService.createProductVersion(product_v, product);

        return await this.productService.getProductById(product.id);
    }
}
