import { ProductInfo } from "@/index";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
    Equal,
    FindManyOptions,
    FindOneOptions,
    ILike,
    IsNull,
    LessThanOrEqual,
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
        product.brand = payload.brand ?? undefined;
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

    async getProductById(productId: string): Promise<ProductEntity> {
        const filter: FindOneOptions<ProductEntity> = {};
        filter.where = { id: Equal(productId) };
        filter.relations = {
            category: true,
            shop: true,
            product_v: { photo: { photo: true } },
        };
        filter.select = {
            id: true,
            title: true,
            sales: true,
            created_at: true,
            description: true,
            brand: true,
            updated_at: true,
        };

        let product: ProductEntity;

        try {
            product = await this.productRepo.findOneOrFail(filter);
        } catch (error) {
            throw new HttpException("PRODUCT_NOT_FOUND", HttpStatus.NOT_FOUND);
        }

        return product;
    }

    async findProduct(text: string, page = 1): Promise<ProductEntity[]> {
        let products: ProductEntity[];
        const filter: FindManyOptions<ProductEntity> = {};

        filter.where = [
            { brand: ILike(`%${text ?? ""}%`) },
            { description: ILike(`%${text ?? ""}%`) },
            { title: ILike(`%${text ?? ""}%`) },
            { category: { title: ILike(`%${text ?? ""}%`) } },
        ];
        filter.relations = {
            shop: true,
            category: true,
            product_v: { photo: { photo: true } },
        };
        filter.select = {
            id: true,
            brand: true,
            title: true,
            description: true,
            created_at: true,
            sales: true,
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

    async updateProduct(
        payload: ProductInfo,
        category?: CategoryEntity
    ): Promise<ProductEntity> {
        const product = await this.getProductById(payload.id);

        product.brand = payload.brand ?? product.brand;
        product.description = payload.description ?? product.description;
        product.title = payload.title ?? product.title;
        product.category = category ?? product.category;

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

    async loadProductStat() {
        const stat = {
            total_product: await this.productRepo.count(),
            total_variant: await this.product_vRepo.count(),
            total_category: await this.categoryRepo.count(),
            product_without_category: await this.productRepo.count({
                where: { category: IsNull() },
            }),

            product_out_of_stock: await this.product_vRepo.count({
                where: { quantity: LessThanOrEqual(0) },
            }),
            total_order: 0,
            total_insitu: 0,
            total_delivery: 0,
        };

        return stat;
    }
}
