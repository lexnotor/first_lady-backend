import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RoleService } from "./role.service";
import { UserController } from "./user.controller";
import {
    RoleEntity,
    UserEntity,
    UserShopEntity,
    UserShopRoleEntity,
} from "./user.entity";
import { UserService } from "./user.service";
import { ConfigModule } from "@nestjs/config";

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            UserShopEntity,
            RoleEntity,
            UserShopRoleEntity,
        ]),
        JwtModule,
        ConfigModule,
    ],
    controllers: [UserController],
    providers: [UserService, RoleService],
    exports: [UserService, RoleService],
})
export class UserModule {}
