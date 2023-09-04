import { ApiResponse } from "@/index";
import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Query,
    UseGuards,
} from "@nestjs/common";
import { User, UserIdentity } from "../auth/auth.decorator";
import { AuthGuard } from "../auth/auth.guard";
import { ShopService } from "../shop/shop.service";
import {
    CreateCategoryDto,
    CreateProductDto,
    CreateVersionDto,
    FindCategoryDto,
    FindProductDto,
    FindProductVersionDto,
    UpdateVerisonDto,
} from "./product.dto";
import {
    CategoryEntity,
    ProductEntity,
    ProductVersionEntity,
} from "./product.entity";
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
        @Body() payload: CreateProductDto,
        @User() user: UserIdentity
    ): Promise<ApiResponse<ProductEntity>> {
        const product_ = payload.getProduct(),
            // product_v = payload.getProduct_v(),
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
        // await this.productService.createProductVersion(product_v, product);

        return {
            message: "PRODUCT_CREATED",
            data: await this.productService.getProductById(product.id),
        };
    }

    @Post("version/new")
    async createVersion(
        @Body() payload: CreateVersionDto
    ): Promise<ApiResponse<ProductEntity>> {
        const product = await this.productService.getProductById(
            payload.getproduct()
        );
        await this.productService.createProductVersion(
            payload.getVersion(),
            product
        );

        return {
            message: "PRODUCT_VERSION_CREATED",
            data: await this.productService.getProductById(product.id),
        };
    }

    @Post("category/new")
    @UseGuards(AuthGuard)
    async createCategory(
        @Body() payload: CreateCategoryDto,
        @User() user: UserIdentity
    ): Promise<ApiResponse<CategoryEntity>> {
        // find shop
        const shop = await this.shopService.getShopById(user.shop);

        // create category
        const category = await this.productService.createCategory(
            payload.getCategory(),
            shop
        );

        category.shop = undefined;

        return {
            message: "CATEGORY_CREATED",
            data: category,
        };
    }

    @Post("photo/set")
    @UseGuards(AuthGuard)
    async setPhoto(@Query() data: any) {
        return data;
    }

    @Get()
    async findProduct(
        @Query() query: FindProductDto
    ): Promise<ApiResponse<ProductEntity[] | ProductEntity>> {
        const { id: productID, page, text } = query;

        const products = productID
            ? await this.productService.getProductById(productID)
            : await this.productService.findProduct(text, page);

        return { message: "PRODUCT_FOUND", data: products };
    }

    @Get("/version")
    async findProductVersion(
        @Query() query: FindProductVersionDto
    ): Promise<ApiResponse<ProductVersionEntity[] | ProductVersionEntity>> {
        const { id: productVID, page, text } = query;

        const products = productVID
            ? await this.productService.getProductVersionById(productVID)
            : await this.productService.findProductVersion(text, page);

        return { message: "PRODUCT_VERSION_FOUND", data: products };
    }

    @Get("category")
    async findCategory(
        @Query() query: FindCategoryDto
    ): Promise<ApiResponse<CategoryEntity[] | CategoryEntity>> {
        const { shop: shopId, text, id: categId, page } = query;
        const categories = categId
            ? await this.productService.getCategoryById(categId)
            : await this.productService.findCategory(text, shopId, page);

        return {
            message: "CATEGORIES_FOUND",
            data: categories,
        };
    }

    @Get("category/count")
    async countProductCategorie(): Promise<
        ApiResponse<{ id: string; title: string; count: string }>
    > {
        return {
            message: "CATEGORY_STAT",
            data: await this.productService.countProductByCategory(),
        };
    }

    @Get("stats")
    async getProductStats(): Promise<ApiResponse> {
        const stat = await this.productService.loadProductStat();

        return { message: "STAT_FOUND", data: stat };
    }

    @Put("version/:id")
    @UseGuards(AuthGuard)
    async updateProductVersion(
        @Param("id") versionId: string,
        @Body() payload: UpdateVerisonDto
    ): Promise<ApiResponse> {
        const version = await this.productService.updateProductVersion({
            ...payload,
            id: versionId,
        });
        return {
            message: "PRODUCT_UPDATED",
            data: version,
        };
    }
}
