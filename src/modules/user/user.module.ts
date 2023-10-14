import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
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
        JwtModule,
        ConfigModule,
    ],
    controllers: [UserController],
    providers: [UserService, RoleService],
    exports: [UserService, RoleService],
})
export class UserModule {}
