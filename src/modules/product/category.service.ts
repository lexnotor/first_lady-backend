import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CategoryEntity, ProductEntity } from "./product.entity";
import { InjectRepository } from "@nestjs/typeorm";
import {
    Equal,
    FindManyOptions,
    FindOneOptions,
    Like,
    Repository,
} from "typeorm";
import { CategoryInfo } from "@/index";
import { ShopEntity } from "../shop/shop.entity";

@Injectable()
export class CategoryService {
    pageSize = 20;
    constructor(
        @InjectRepository(CategoryEntity)
        private readonly categoryRepo: Repository<CategoryEntity>
    ) {}

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

    async findCategory(
        text: string,
        shopId?: string,
        page = 1
    ): Promise<CategoryEntity[]> {
        let categories: CategoryEntity[];

        const filter: FindManyOptions<CategoryEntity> = {};

        filter.where = [
            {
                description: Like(`%${text ?? ""}%`),
                shop: shopId ? Equal(shopId) : undefined,
            },
            {
                title: Like(`%${text ?? ""}%`),
                shop: shopId ? Equal(shopId) : undefined,
            },
        ];
        filter.order = { created_at: "DESC" };
        (page - 1) * this.pageSize;
        // filter.take = this.pageSize;
        filter.relations = { shop: true };

        try {
            categories = await this.categoryRepo.find(filter);
            if (categories.length == 0) throw new Error("EMPTY_RESULTS");
        } catch (error) {
            throw new HttpException("NOT_CATEGORY_FOUND", HttpStatus.NOT_FOUND);
        }

        return categories;
    }

    async countProductByCategory(): Promise<any> {
        try {
            return await this.categoryRepo
                .createQueryBuilder("categories")
                .leftJoinAndSelect(
                    ProductEntity,
                    "products",
                    "products.category_id = categories.id"
                )
                .groupBy("categories.id ,categories.title")
                .select("categories.id", "id")
                .addSelect("categories.title", "title")
                .addSelect("count(products.id)", "products")
                .getRawMany();
        } catch (error) {
            throw new HttpException("", HttpStatus.SERVICE_UNAVAILABLE);
        }
    }
}
