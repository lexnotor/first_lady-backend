import { Module } from "@nestjs/common";
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

@Module({
    imports: [
        TypeOrmModule.forFeature([
            UserEntity,
            UserShopEntity,
            RoleEntity,
            UserShopRoleEntity,
        ]),
    ],
    controllers: [UserController],
    providers: [UserService, RoleService],
})
export class UserModule {}
