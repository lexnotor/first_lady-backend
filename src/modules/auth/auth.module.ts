import { Module, forwardRef } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokenEntity, UserEntity } from "../user/user.entity";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UserModule } from "../user/user.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([UserEntity, TokenEntity]),
        JwtModule,
        ConfigModule,
        forwardRef(() => UserModule),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtService, ConfigService],
    exports: [JwtService, ConfigService, TypeOrmModule],
})
export class AuthModule {}
