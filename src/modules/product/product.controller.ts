import { ApiResponse } from "@/index";
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    Post,
    Put,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { HasRole, User, UserIdentity } from "../auth/auth.decorator";
import { AuthGuard } from "../auth/auth.guard";
import { ShopService } from "../shop/shop.service";
import { PrintableService } from "./printable.service";
import {
    AddPhotoDto,
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
import { isUUID } from "class-validator";
import { RoleType } from "../user/user.entity";

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
    // cet endpoint permet de créer un produit dans la base de données
    // il faudra ensuite créer une version du produit ailleur
    @Post("new")
    @HasRole(RoleType.UPDATE_PRODUCT)
    @UseGuards(AuthGuard)
    async createProduct(
        @Body() payload: CreateProductDto,
        @User() user: UserIdentity
    ): Promise<ApiResponse<ProductEntity>> {
        // on extrait les informations dans le body de la requête
        const product_ = payload.getProduct(),
            categoryId = payload.getCategoryId(),
            shopId = user.shop;

        // on recherche la categorie  dans le base de données
        // NB: seulement si c'est specifier
        const category = categoryId
            ? await this.categoryService.getCategoryById(categoryId)
            : undefined;

        // on recherche la boutique dans la base de données
        const shop = await this.shopService.getShopById(shopId);

        // finalement on créer le produit dans la base données avec toutes ces informations
        const product = await this.productService.createProduct(
            product_,
            shop,
            category
        );

        // on retourne les données du produit créer
        return {
            message: "PRODUCT_CREATED",
            data: await this.productService.getProductById(product.id),
        };
    }

    // cet endpoint permet de chercher les produits suivant des filtres données
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

    // cet endpoint permet de mettre à jour un produit donné
    @Put("update/:id")
    @UseGuards(AuthGuard)
    @HasRole(RoleType.UPDATE_PRODUCT)
    async updateProduct(
        @Body() payload: UpdateProductDto,
        @Param("id") productId: string
    ): Promise<ApiResponse<ProductEntity>> {
        // si l'utilisateur à specifié une nouvelle category
        // alors on la cherche dans la base de données
        const category = payload.category
            ? await this.categoryService.getCategoryById(payload.category)
            : undefined;

        // on met à jour le produit
        const product = await this.productService.updateProduct(
            {
                ...payload.getProduct(),
                id: productId,
            },
            category
        );

        // on retourne le produit à jour
        return {
            message: "PRODUCT_UPDATED",
            data: await this.productService.getProductById(product.id),
        };
    }

    // -----------------------------------------
    // ----------- VERSION ---------------------
    // -----------------------------------------
    // cet endpoint permet de créer une nouvelle variante du produit
    @Post("version/new")
    @HasRole(RoleType.UPDATE_PRODUCT)
    async createVersion(
        @Body() payload: CreateVersionDto
    ): Promise<ApiResponse<ProductVersionEntity>> {
        // on cherche un produit dans la base de donées
        const product = await this.productService.getProductById(
            payload.getproduct()
        );
        // on enregistrer le produit
        const product_v = await this.productVersionService.createProductVersion(
            payload.getVersion(),
            product
        );

        // on retourne la nouvelle variante
        return {
            message: "PRODUCT_VERSION_CREATED",
            data: await this.productVersionService.getProductVersionById(
                product_v.id
            ),
        };
    }

    // cet endpoint permet de trouver les variants des produits
    @Get("/version")
    async findProductVersion(
        @Query() query: FindProductVersionDto
    ): Promise<ApiResponse<ProductVersionEntity[] | ProductVersionEntity>> {
        // on extrait les principaux element de recherche
        const { id: productVID, page, text, ...filter } = query;

        // on effectue la recherche dans la BD en fonction de ce qui est fournit
        const products = productVID
            ? await this.productVersionService.getProductVersionById(productVID)
            : filter.maxPrice ||
              filter.maxQty ||
              filter.minPrice ||
              filter.minQty ||
              filter.categoryId
            ? await this.productVersionService.findProductVersion(
                  text,
                  page,
                  filter
              )
            : await this.productVersionService.findProductVersion(text, page);

        return { message: "PRODUCT_VERSION_FOUND", data: products };
    }

    // cet endpoint renvoie un resumé des produits
    @Get("summary")
    async getSummary(
        @Query() query: FindProductVersionDto
    ): Promise<ApiResponse> {
        return {
            message: "GENERATE_PDF",
            data: await this.printableService.generatePrintable(query),
        };
    }

    // cet endpoint permet de mettre à jour une variante d'un produit
    // il sert donc aussi lors de l'approvisionnement
    @Put("version/update/:id")
    @UseGuards(AuthGuard)
    @HasRole(RoleType.UPDATE_PRODUCT)
    async updateProductVersion(
        @Param("id") versionId: string,
        @Body() payload: UpdateVerisonDto
    ): Promise<ApiResponse<ProductVersionEntity>> {
        // Si c'est l'approvisionnement qui est effectué alors:
        const version = payload.quantity
            ? await this.productVersionService.addQuantity(
                  versionId,
                  payload.quantity,
                  payload.price
              )
            : // sinon c'est autre chose:
              await this.productVersionService.updateProductVersion({
                  ...payload,
                  id: versionId,
              });
        // enfin on retourne la nouvelle variant à jour
        return {
            message: "PRODUCT_UPDATED",
            data: await this.productVersionService.getProductVersionById(
                version.id
            ),
        };
    }

    // cet endpoint permet de supprimer une variant du produit
    @Delete("version/:id")
    @UseGuards(AuthGuard)
    @HasRole(RoleType.UPDATE_PRODUCT)
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

    // cet endpoint permet d'ajouter la photo sur une variant
    @Put("version/photo")
    @UseGuards(AuthGuard)
    @HasRole(RoleType.UPDATE_PRODUCT)
    @UseInterceptors(FileInterceptor("file"))
    async setPhoto(
        @Query() query: AddPhotoDto,
        @UploadedFile() file: Express.Multer.File
    ): Promise<ApiResponse<ProductVersionEntity>> {
        // Si on a pas preciser l'id de la variante
        // alors on retourne une erreur
        if (!isUUID(query.productVId))
            throw new HttpException(
                "PRODUCT_VERSION_INVALIDE",
                HttpStatus.BAD_REQUEST
            );

        // on enregistre la photo
        const version = await this.productVersionService.setPhoto(
            file,
            query.productVId
        );
        // ensuite on retourne la nouvelle version avec photo
        return {
            message: "PHOTO_UPDATED",
            data: await this.productVersionService.getProductVersionById(
                version.id
            ),
            extra: query,
        };
    }

    // -----------------------------------------
    // ----------- CATEGORY --------------------
    // -----------------------------------------
    // cet enpoint permet de créer une category de produit
    @Post("category/new")
    @UseGuards(AuthGuard)
    @HasRole(RoleType.UPDATE_PRODUCT)
    async createCategory(
        @Body() payload: CreateCategoryDto,
        @User() user: UserIdentity
    ): Promise<ApiResponse<CategoryEntity>> {
        // on recupere l'id de la boutique dans la BD
        const shop = await this.shopService.getShopById(user.shop);

        // on créer la category associer à la boutique
        const category = await this.categoryService.createCategory(
            payload.getCategory(),
            shop
        );

        // on retourne la nouvelle category
        return {
            message: "CATEGORY_CREATED",
            data: await this.categoryService.getCategoryById(category.id),
        };
    }

    // cet endpoint permet de chercher des category dans la BD
    @Get("category")
    async findCategory(
        @Query() query: FindCategoryDto
    ): Promise<ApiResponse<CategoryEntity[] | CategoryEntity>> {
        //on extrait les fitrers
        const { shop: shopId, text, id: categId, page } = query;

        // on fonction de ce qui est donnée, on effectue la recheche
        const categories = categId
            ? await this.categoryService.getCategoryById(categId)
            : await this.categoryService.findCategory(text, shopId, page);

        return {
            message: "CATEGORIES_FOUND",
            data: categories,
        };
    }

    // cet enpoint renvoi des statistique sur les categories
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
    // cet end point renvoi les statistiques sur les produits, variants et categories
    @Get("stats")
    async getProductStats(): Promise<ApiResponse> {
        const stat = await this.productService.loadProductStat();

        return { message: "STAT_FOUND", data: stat };
    }
}
