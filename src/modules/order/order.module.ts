import { Module } from "@nestjs/common";
import { OrderController } from "./order.controller";
import { OrderService } from "./order.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import {
    OrderEntity,
    OrderProductEntity,
    PaiementEntity,
} from "./order.entity";
import { CartModule } from "../cart/cart.module";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "../auth/auth.module";
import { UserModule } from "../user/user.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            OrderEntity,
            OrderProductEntity,
            PaiementEntity,
        ]),
        CartModule,
        ConfigModule,
        UserModule,
        AuthModule,
    ],
    controllers: [OrderController],
    providers: [OrderService],
})
export class OrderModule {}
