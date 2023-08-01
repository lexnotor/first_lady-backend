import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ShopController } from "./shop.controller";
import { ShopEntity } from "./shop.entity";
import { ShopService } from "./shop.service";
import { UserModule } from "../user/user.module";
import { AuthModule } from "../auth/auth.module";

@Module({
    imports: [TypeOrmModule.forFeature([ShopEntity]), UserModule, AuthModule],
    controllers: [ShopController],
    providers: [ShopService],
    exports: [ShopService],
})
export class ShopModule {}
