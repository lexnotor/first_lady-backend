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
import { PrintableService } from "./printable.service";
import { ProductVersionService } from "./productVersion.service";
import { CategoryService } from "./category.service";

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
    providers: [
        ProductService,
        PrintableService,
        ProductVersionService,
        CategoryService,
    ],
    exports: [ProductService, ProductVersionService],
})
export class ProductModule {}
