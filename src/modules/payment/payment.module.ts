import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { CartModule } from "../cart/cart.module";
import { PaiementEntity } from "../order/order.entity";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([PaiementEntity]),
        CartModule,
        ConfigModule,
        AuthModule,
    ],
    controllers: [PaymentController],
    providers: [PaymentService],
})
export class PaymentModule {}
