import { Module } from "@nestjs/common";
import { FactureController } from "./facture.controller";
import { FactureService } from "./facture.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderEntity, OrderProductEntity } from "../order/order.entity";
import { OrderModule } from "../order/order.module";
import { ProductVersionEntity } from "../product/product.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            OrderEntity,
            OrderProductEntity,
            ProductVersionEntity,
        ]),
        OrderModule,
    ],
    controllers: [FactureController],
    providers: [FactureService],
})
export class FactureModule {}
