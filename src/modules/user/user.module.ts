import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "../auth/auth.module";
import { ShopModule } from "../shop/shop.module";
import { RoleService } from "./role.service";
import { UserController } from "./user.controller";
import {
    RoleEntity,
    TokenEntity,
    UserEntity,
    UserShopEntity,
    UserShopRoleEntity,
} from "./user.entity";
import { UserService } from "./user.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            UserShopEntity,
            RoleEntity,
            UserShopRoleEntity,
            TokenEntity,
        ]),
        forwardRef(() => AuthModule),
        ShopModule,
    ],
    controllers: [UserController],
    providers: [UserService, RoleService],
    exports: [UserService, RoleService],
})
export class UserModule {}
