import { CategoryInfo, ProductInfo, ProductVersionInfo } from "@/index";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { randomUUID } from "crypto";
import {
    Equal,
    FindManyOptions,
    FindOneOptions,
    Like,
    Repository,
} from "typeorm";
import { ShopEntity } from "../shop/shop.entity";
import {
    CategoryEntity,
    ProductEntity,
    ProductVersionEntity,
} from "./product.entity";

@Injectable()
export class ProductService {
    pageSize = 20;
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepo: Repository<ProductEntity>,
        @InjectRepository(ProductVersionEntity)
        private readonly product_vRepo: Repository<ProductVersionEntity>,
        @InjectRepository(CategoryEntity)
        private readonly categoryRepo: Repository<CategoryEntity>
    ) {}

    async createProduct(
        payload: ProductInfo,
        shop: ShopEntity,
        category?: CategoryEntity
    ) {
        const product = new ProductEntity();

        // required
        product.title = payload.title;
        product.shop = shop ?? undefined;
        product.sales = payload.sales ?? 0;

        // optional
        product.category = category ?? undefined;
        product.brand = payload.brand;
        product.description = payload.description ?? null;

        try {
            await this.productRepo.save(product);
        } catch (error) {
            throw new HttpException(
                "PRODUCT_REQUIREMENT_FAIL",
                HttpStatus.BAD_REQUEST
            );
        }

        return await this.getProductById(product.id);
    }

    async createProductVersion(
        payload: ProductVersionInfo,
        product: ProductEntity
    ): Promise<ProductVersionEntity> {
        const product_v = new ProductVersionEntity();

        product_v.description =
            payload.description ?? product.description ?? null;
        product_v.key_id = randomUUID();
        product_v.quantity = payload.quantity ?? 0;
        product_v.price = payload.price ?? 0;
        product_v.title = "Default";

        product_v.product = product;

        try {
            await this.product_vRepo.save(product_v);
        } catch (error) {
            throw new HttpException(
                "PRODUCT_VERSION_REQUIREMENT_FAIL",
                HttpStatus.BAD_REQUEST
            );
        }
        return product_v;
    }

    async createCategory(
        payload: CategoryInfo,
        shop: ShopEntity
    ): Promise<CategoryEntity> {
        const category = new CategoryEntity();

        category.title = payload.title;
        category.description = payload.description ?? null;
        category.shop = shop;

        try {
            await this.categoryRepo.save(category);
        } catch (error) {
            throw new HttpException(
                "CATEGORY_REQUIREMENT_FAIL",
                HttpStatus.BAD_REQUEST
            );
        }

        return category;
    }

    async getProductById(productId: string): Promise<ProductEntity> {
        const filter: FindOneOptions<ProductEntity> = {};
        filter.where = { id: Equal(productId) };
        filter.relations = {
            category: true,
            shop: true,
            product_v: true,
        };
        filter.select = {
            id: true,
            title: true,
            sales: true,
            created_at: true,
            shop: { title: true, id: true },
            category: { created_at: true, title: true, id: true },
            product_v: {
                created_at: true,
                id: true,
                key_id: true,
                price: true,
                quantity: true,
                title: true,
                description: true,
            },
        };

        let product: ProductEntity;

        try {
            product = await this.productRepo.findOneOrFail(filter);
        } catch (error) {
            throw new HttpException("PRODUCT_NOT_FOUND", HttpStatus.NOT_FOUND);
        }

        return product;
    }

    async getCategoryById(id: string): Promise<CategoryEntity> {
        let category: CategoryEntity;
        const filter: FindOneOptions<CategoryEntity> = {};
        filter.where = { id: Equal(id) };
        filter.select = { id: true, title: true };

        try {
            category = await this.categoryRepo.findOneOrFail(filter);
        } catch (error) {
            throw new HttpException("CATEGORY_NOT_FOUND", HttpStatus.NOT_FOUND);
        }

        return category;
    }

    async findProduct(text: string, page = 1): Promise<ProductEntity[]> {
        let products: ProductEntity[];
        const filter: FindManyOptions<ProductEntity> = {};

        filter.where = [
            { brand: Like(`%${text ?? ""}%`) },
            { description: Like(`%${text ?? ""}%`) },
            { title: Like(`%${text ?? ""}%`) },
        ];
        filter.relations = { shop: true, category: true };
        filter.select = {
            id: true,
            brand: true,
            title: true,
            description: true,
            created_at: true,
            category: { title: true, id: true },
            shop: { id: true, title: true },
        };
        filter.order = { created_at: "DESC" };
        filter.skip = (page - 1) * this.pageSize;
        filter.take = this.pageSize;

        try {
            products = await this.productRepo.find(filter);
            if (products.length == 0) throw new Error("EMPTY_RESULT");
        } catch (error) {
            throw new HttpException("NO_PRODUCT_FOUND", HttpStatus.NOT_FOUND);
        }

        return products;
    }

    async updateProduct(payload: ProductInfo): Promise<ProductEntity> {
        const product = await this.getProductById(payload.id);

        product.brand = payload.brand ?? product.brand;
        product.description = payload.description ?? product.description;
        product.title = payload.title ?? product.title;

        try {
            await this.productRepo.save(product);
        } catch (error) {
            throw new HttpException(
                "PRODUCT_NOT_MODIFIED",
                HttpStatus.NOT_MODIFIED
            );
        }

        return await this.getProductById(product.id);
    }

    async deleteProduct(productId: string): Promise<string> {
        const product = await this.getProductById(productId);

        try {
            await this.productRepo.softRemove(product);
        } catch (error) {
            throw new HttpException(
                "FAIL_TO_DELETE_PRODUCT",
                HttpStatus.NOT_MODIFIED
            );
        }
        return productId;
    }
}
