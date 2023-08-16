import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { CartModule } from "../cart/cart.module";
import { UserModule } from "../user/user.module";
import { OrderController } from "./order.controller";
import { OrderEntity, OrderProductEntity } from "./order.entity";
import { OrderService } from "./order.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([OrderEntity, OrderProductEntity]),
        CartModule,
        UserModule,
        AuthModule,
    ],
    controllers: [OrderController],
    providers: [OrderService],
    exports: [OrderService],
})
export class OrderModule {}
