import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, FindManyOptions, ILike, Repository } from "typeorm";
import { FindProductVersionDto } from "./product.dto";
import { ProductVersionEntity } from "./product.entity";

@Injectable()
export class PrintableService {
    constructor(
        @InjectRepository(ProductVersionEntity)
        private readonly productRepo: Repository<ProductVersionEntity>
    ) {}

    async generatePrintable(filters: Partial<FindProductVersionDto>) {
        const products_v =
            filters.maxPrice |
            filters.maxQty |
            filters.minPrice |
            filters.minQty
                ? await this.findProductVersion(filters.text, filters)
                : await this.findProductVersion(filters.text);

        const res = products_v.map((version) => {
            return {
                product: version.product.title,
                version: version.title,
                category: version.product.category.title,
                price: version.price,
                quantity: version.quantity,
            };
        });

        return res;
    }

    private async findProductVersion(
        text: string,
        reqFilters?: Partial<FindProductVersionDto>
    ) {
        let product_v: ProductVersionEntity[];

        const filter: FindManyOptions<ProductVersionEntity> = {};
        filter.relations = { product: { category: true } };
        filter.where = reqFilters
            ? {
                  title: ILike(`%${text ?? ""}%`),
                  quantity: Between(
                      reqFilters.minQty ?? 0,
                      reqFilters.maxQty ?? 9e8
                  ),
                  price: Between(
                      reqFilters.minPrice ?? 0,
                      reqFilters.maxPrice ?? 9e8
                  ),
              }
            : [
                  { description: ILike(`%${text ?? ""}%`) },
                  { title: ILike(`%${text ?? ""}%`) },
              ];

        filter.order = { title: "ASC", created_at: "DESC" };

        try {
            product_v = await this.productRepo.find(filter);
        } catch (error) {
            throw new HttpException(
                "CAN_GENERATE_PRINTABLE",
                HttpStatus.FORBIDDEN
            );
        }

        return product_v;
    }
}
