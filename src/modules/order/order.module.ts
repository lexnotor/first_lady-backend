import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderEntity, OrderProductEntity } from "./order.entity";
import { CartModule } from "../cart/cart.module";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([OrderEntity, OrderProductEntity]),
        CartModule,
        ConfigModule,
        AuthModule,
    ],
    controllers: [OrderController],
    providers: [OrderService],
})
export class OrderModule {}
