import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { ProductModule } from "../product/product.module";
import { BasketController } from "./basket.controller";
import { BasketEntity, BasketProductEntity } from "./basket.entity";
import { BasketService } from "./basket.service";
import { UserModule } from "../user/user.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([BasketEntity, BasketProductEntity]),
        ProductModule,
        UserModule,
        AuthModule,
    ],
    controllers: [BasketController],
    providers: [BasketService],
})
export class BasketModule {}
