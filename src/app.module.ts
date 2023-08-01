import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "./modules/auth/auth.module";
import { DbconfigService } from "./modules/dbconfig/dbconfig.service";
import { ProductModule } from "./modules/product/product.module";
import { ShopModule } from "./modules/shop/shop.module";
import { UserModule } from "./modules/user/user.module";

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useClass: DbconfigService,
        }),
        AuthModule,
        UserModule,
        ShopModule,
        ProductModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
