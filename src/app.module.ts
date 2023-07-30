import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DbconfigService } from "./modules/dbconfig/dbconfig.service";
import { ShopModule } from "./modules/shop/shop.module";

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useClass: DbconfigService,
        }),
        ShopModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
