import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { AuthGuard } from "../auth/auth.guard";
import { ShopService } from "../shop/shop.service";
import {
    CreateCategoryDto,
    CreateProductDto,
    CreateVersionDto,
    FindCategoryDto,
    FindProductDto,
} from "./product.dto";
import { CategoryEntity, ProductEntity } from "./product.entity";
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
            shopId = user.shop;

        // find category
        const category = categoryId
            ? await this.productService.getCategoryById(categoryId)
            : undefined;

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

    @Post("version/new")
    async createVersion(
        @Body() payload: CreateVersionDto
    ): Promise<ProductEntity> {
        const product = await this.productService.getProductById(
            payload.getproduct()
        );
        await this.productService.createProductVersion(
            payload.getVersion(),
            product
        );

        return await this.productService.getProductById(product.id);
    }

    @Post("category/new")
    @UseGuards(AuthGuard)
    async createCategory(
        @Body() payload: CreateCategoryDto,
        @User() user: UserIdentity
    ) {
        // find shop
        const shop = await this.shopService.getShopById(user.shop);

        // create category
        const category = await this.productService.createCategory(
            payload.getCategory(),
            shop
        );

        category.shop = undefined;

        return category;
    }

    @Post("photo/set")
    @UseGuards(AuthGuard)
    async setPhoto(@Query() data: any) {
        return data;
    }

    @Get()
    async findProduct(
        @Query() query: FindProductDto
    ): Promise<ProductEntity[] | ProductEntity> {
        const { id: productID, page, text } = query;

        const products = productID
            ? await this.productService.getProductById(productID)
            : await this.productService.findProduct(text, page);

        return products;
    }
    @Get("category")
    async findCategory(
        @Query() query: FindCategoryDto
    ): Promise<CategoryEntity[] | CategoryEntity> {
        const { shop: shopId, text, id: categId, page } = query;
        const categories = categId
            ? await this.productService.getCategoryById(categId)
            : await this.productService.findCategory(text, shopId, page);

        return categories;
    }
}
