import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { OrderModule } from "../order/order.module";

@Module({
    imports: [OrderModule, ConfigModule],
    // controllers: [FactureController],
    // providers: [FactureService],
})
export class FactureModule {}
