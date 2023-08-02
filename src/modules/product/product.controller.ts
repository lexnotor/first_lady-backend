import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { ShopService } from "../shop/shop.service";
import { CreateCategoryDto, CreateProductDto } from "./product.dto";
import { ProductEntity } from "./product.entity";
import { ProductService } from "./product.service";
import { User, UserIdentity } from "../auth/auth.decorator";

@Controller("product")
export class ProductController {
    constructor(
        private readonly productService: ProductService,
        private readonly shopService: ShopService
    ) {}

    @Post("new")
    @UseGuards(AuthGuard)
    async createProduct(
        @Body() payload: CreateProductDto,
        @User() user: UserIdentity
    ): Promise<ProductEntity> {
        const product_ = payload.getProduct(),
            product_v = payload.getProduct_v(),
            categoryId = payload.getCategoryId(),
            shopId = user.shop ?? payload.getShopId();

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

    @Post("category/new")
    @UseGuards(AuthGuard)
    async createCategory(
        @Body() payload: CreateCategoryDto,
        @User() user: UserIdentity
    ) {
        // find shop
        const shop = await this.shopService.getShopById(
            user.shop ?? payload.shop
        );

        // create category
        const category = await this.productService.createCategory(
            payload.getCategory(),
            shop
        );

        return category;
    }
}
