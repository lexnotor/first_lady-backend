import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { ShopModule } from "../shop/shop.module";
import { ProductController } from "./product.controller";
import {
    CategoryEntity,
    ProductEntity,
    ProductVersionEntity,
} from "./product.entity";
import { ProductService } from "./product.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ProductEntity,
            CategoryEntity,
            ProductVersionEntity,
        ]),
        AuthModule,
        ShopModule,
    ],
    controllers: [ProductController],
    providers: [ProductService],
})
export class ProductModule {}
