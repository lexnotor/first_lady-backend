import { Module } from "@nestjs/common";
import { OrderModule } from "../order/order.module";
import { FactureController } from "./facture.controller";
import { FactureService } from "./facture.service";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [OrderModule, ConfigModule],
    controllers: [FactureController],
    providers: [FactureService],
})
export class FactureModule {}
