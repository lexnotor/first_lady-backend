import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CategoryEntity, ProductEntity } from "./product.entity";
import { ProductInfo } from "@/index";
import { ShopEntity } from "../shop/shop.entity";

@Injectable()
export class ProductService {
    constructor(
        @InjectRepository(ProductEntity)
        private readonly productRepo: Repository<ProductEntity>
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
        product.sales = 0;

        // optional
        product.category = category;
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

        return product;
    }
}
