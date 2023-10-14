import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { UserModule } from "../user/user.module";
import { ShopController } from "./shop.controller";
import { ShopEntity } from "./shop.entity";
import { ShopService } from "./shop.service";

@Module({
    imports: [TypeOrmModule.forFeature([ShopEntity]), UserModule, AuthModule],
    controllers: [ShopController],
    providers: [ShopService],
    exports: [ShopService],
})
export class ShopModule {}
