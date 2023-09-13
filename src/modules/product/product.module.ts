import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { VersionPhotoEntity } from "../photo/photo.entity";
import { PhotoModule } from "../photo/photo.module";
import { ShopModule } from "../shop/shop.module";
import { UploaderModule } from "../uploader/uploader.module";
import { CategoryService } from "./category.service";
import { PrintableService } from "./printable.service";
import { ProductController } from "./product.controller";
import {
    CategoryEntity,
    ProductEntity,
    ProductVersionEntity,
} from "./product.entity";
import { ProductService } from "./product.service";
import { ProductVersionService } from "./productVersion.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            ProductEntity,
            CategoryEntity,
            ProductVersionEntity,
            VersionPhotoEntity,
        ]),
        AuthModule,
        ShopModule,
        UploaderModule,
        PhotoModule,
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
