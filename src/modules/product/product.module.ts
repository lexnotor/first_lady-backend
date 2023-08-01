import { Module } from "@nestjs/common";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
    CategoryEntity,
    ProductEntity,
    ProductVersionEntity,
} from "./product.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ProductEntity,
            CategoryEntity,
            ProductVersionEntity,
        ]),
    ],
    controllers: [ProductController],
    providers: [ProductService],
})
export class ProductModule {}
