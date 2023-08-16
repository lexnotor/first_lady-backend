import { Module } from "@nestjs/common";
import { OrderModule } from "../order/order.module";
import { FactureController } from "./facture.controller";
import { FactureService } from "./facture.service";

@Module({
    imports: [OrderModule],
    controllers: [FactureController],
    providers: [FactureService],
})
export class FactureModule {}
