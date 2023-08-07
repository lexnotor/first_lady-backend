import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderEntity, OrderProductEntity } from "./order.entity";
import { CartModule } from "../cart/cart.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([OrderEntity, OrderProductEntity]),
        CartModule,
    ],
    controllers: [OrderController],
    providers: [OrderService],
})
export class OrderModule {}
