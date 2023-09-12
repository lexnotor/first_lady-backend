import { ApiResponse } from "@/index";
import {
    Body,
    Controller,
    Delete,
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
import { PrintableService } from "./printable.service";
import {
    CreateCategoryDto,
    CreateProductDto,
    CreateVersionDto,
    FindCategoryDto,
    FindProductDto,
    FindProductVersionDto,
    UpdateProductDto,
    UpdateVerisonDto,
} from "./product.dto";
import {
    CategoryEntity,
    ProductEntity,
    ProductVersionEntity,
} from "./product.entity";
import { ProductService } from "./product.service";
import { ProductVersionService } from "./productVersion.service";
import { CategoryService } from "./category.service";

@Controller("product")
export class ProductController {
    constructor(
        private readonly productService: ProductService,
        private readonly productVersionService: ProductVersionService,
        private readonly categoryService: CategoryService,
        private readonly shopService: ShopService,
        private readonly printableService: PrintableService
    ) {}

    // -----------------------------------------
    // ----------- PRODUCT ---------------------
    // -----------------------------------------
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
            ? await this.categoryService.getCategoryById(categoryId)
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

    @Put("update/:id")
    @UseGuards(AuthGuard)
    async updateProduct(
        @Body() payload: UpdateProductDto,
        @Param("id") productId: string
    ): Promise<ApiResponse<ProductEntity>> {
        const category = payload.category
            ? await this.categoryService.getCategoryById(payload.category)
            : undefined;

        return {
            message: "PRODUCT_UPDATED",
            data: await this.productService.updateProduct(
                {
                    ...payload.getProduct(),
                    id: productId,
                },
                category
            ),
        };
    }

    // -----------------------------------------
    // ----------- VERSION ---------------------
    // -----------------------------------------
    @Post("version/new")
    async createVersion(
        @Body() payload: CreateVersionDto
    ): Promise<ApiResponse<ProductEntity>> {
        const product = await this.productService.getProductById(
            payload.getproduct()
        );
        await this.productVersionService.createProductVersion(
            payload.getVersion(),
            product
        );

        return {
            message: "PRODUCT_VERSION_CREATED",
            data: await this.productService.getProductById(product.id),
        };
    }

    @Get("/version")
    async findProductVersion(
        @Query() query: FindProductVersionDto
    ): Promise<ApiResponse<ProductVersionEntity[] | ProductVersionEntity>> {
        const { id: productVID, page, text, ...filter } = query;

        const products = productVID
            ? await this.productVersionService.getProductVersionById(productVID)
            : filter.maxPrice | filter.maxQty | filter.minPrice | filter.minQty
            ? await this.productVersionService.findProductVersion(
                  text,
                  page,
                  filter
              )
            : await this.productVersionService.findProductVersion(text, page);

        return { message: "PRODUCT_VERSION_FOUND", data: products };
    }

    @Get("summary")
    async getSummary(
        @Query() query: FindProductVersionDto
    ): Promise<ApiResponse> {
        return {
            message: "GENERATE_PDF",
            data: await this.printableService.generatePrintable(query),
        };
    }

    @Put("version/:id")
    @UseGuards(AuthGuard)
    async updateProductVersion(
        @Param("id") versionId: string,
        @Body() payload: UpdateVerisonDto
    ): Promise<ApiResponse> {
        const version = payload.quantity
            ? await this.productVersionService.addQuantity(
                  versionId,
                  payload.quantity,
                  payload.price
              )
            : await this.productVersionService.updateProductVersion({
                  ...payload,
                  id: versionId,
              });
        return {
            message: "PRODUCT_UPDATED",
            data: version,
        };
    }

    @Delete("version/:id")
    @UseGuards(AuthGuard)
    async deleteProductVersion(
        @Param("id") versionId: string
    ): Promise<ApiResponse<string>> {
        return {
            message: "PRODUCT_DELETE",
            data: await this.productVersionService.deleteProductVersion(
                versionId
            ),
        };
    }

    @Post("version/photo")
    @UseGuards(AuthGuard)
    async setPhoto(@Query() data: any) {
        return data;
    }

    // -----------------------------------------
    // ----------- CATEGORY --------------------
    // -----------------------------------------

    @Post("category/new")
    @UseGuards(AuthGuard)
    async createCategory(
        @Body() payload: CreateCategoryDto,
        @User() user: UserIdentity
    ): Promise<ApiResponse<CategoryEntity>> {
        // find shop
        const shop = await this.shopService.getShopById(user.shop);

        // create category
        const category = await this.categoryService.createCategory(
            payload.getCategory(),
            shop
        );

        category.shop = undefined;

        return {
            message: "CATEGORY_CREATED",
            data: category,
        };
    }
    @Get("category")
    async findCategory(
        @Query() query: FindCategoryDto
    ): Promise<ApiResponse<CategoryEntity[] | CategoryEntity>> {
        const { shop: shopId, text, id: categId, page } = query;
        const categories = categId
            ? await this.categoryService.getCategoryById(categId)
            : await this.categoryService.findCategory(text, shopId, page);

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
            data: await this.categoryService.countProductByCategory(),
        };
    }

    // -----------------------------------------
    // ----------- ALL -------------------------
    // -----------------------------------------
    @Get("stats")
    async getProductStats(): Promise<ApiResponse> {
        const stat = await this.productService.loadProductStat();

        return { message: "STAT_FOUND", data: stat };
    }
}
