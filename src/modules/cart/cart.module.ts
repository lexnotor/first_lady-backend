import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { ProductModule } from "../product/product.module";
import { CartController } from "./cart.controller";
import { CartEntity, CartProductEntity } from "./cart.entity";
import { CartService } from "./cart.service";
import { UserModule } from "../user/user.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([CartEntity, CartProductEntity]),
        ProductModule,
        UserModule,
        AuthModule,
    ],
    controllers: [CartController],
    providers: [CartService],
    exports: [CartService],
})
export class CartModule {}
