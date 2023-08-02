import { Module } from "@nestjs/common";
import { BasketController } from "./basket.controller";
import { BasketService } from "./basket.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BasketEntity, BasketProductEntity } from "./basket.entity";
import { ProductModule } from "../product/product.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([BasketEntity, BasketProductEntity]),
        ProductModule,
    ],
    controllers: [BasketController],
    providers: [BasketService],
})
export class BasketModule {}
