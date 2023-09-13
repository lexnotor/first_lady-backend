import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./modules/auth/auth.module";
import { CartModule } from "./modules/cart/cart.module";
import { DbconfigService } from "./modules/dbconfig/dbconfig.service";
import { FactureModule } from "./modules/facture/facture.module";
import { OrderModule } from "./modules/order/order.module";
import { PaymentModule } from "./modules/payment/payment.module";
import { PhotoModule } from "./modules/photo/photo.module";
import { ProductModule } from "./modules/product/product.module";
import { ShopModule } from "./modules/shop/shop.module";
import { UploaderModule } from "./modules/uploader/uploader.module";
import { UserModule } from "./modules/user/user.module";

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useClass: DbconfigService,
        }),
        EventEmitterModule.forRoot({ delimiter: "." }),
        AuthModule,
        UserModule,
        ShopModule,
        ProductModule,
        CartModule,
        OrderModule,
        PaymentModule,
        FactureModule,
        PhotoModule,
        UploaderModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
