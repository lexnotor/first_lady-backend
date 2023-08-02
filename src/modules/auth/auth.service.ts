import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { compareSync, genSaltSync, hash } from "bcrypt";
import { Buffer } from "buffer";
import { randomUUID } from "crypto";
import { Repository } from "typeorm";
import { CreateUserDto } from "../user/user.dto";
import { UserEntity } from "../user/user.entity";
import { UserService } from "../user/user.service";
import { UserIdentity } from "./auth.decorator";

@Injectable()
export class AuthService {
    salt: string;
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepo: Repository<UserEntity>,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly userService: UserService
    ) {
        const round =
            +this.configService.get<number>("SECRET_HASH_ROUND") || 10;
        this.salt = genSaltSync(round);
    }

    async hashSecret(secret: string) {
        return await hash(secret, this.salt);
    }

    async basicLogin(credential: string, psw: string = null, shopId?: string) {
        if (!psw) [credential, psw] = this.extractBasicCredential(credential);

        try {
            // Find user
            const user = await this.userRepo.findOneOrFail({
                where: {
                    username: credential,
                    shops: shopId ? { shop: { id: shopId } } : undefined,
                },
                select: {
                    secret: true,
                    id: true,
                    username: true,
                },
                relations: { shops: { shop: true, roles: { role: true } } },
                loadEagerRelations: true,
            });

            // extract first shop
            const [currentShop] = shopId ? user.shops || [] : null;

            if (currentShop?.shop?.id != shopId)
                throw new Error("USER_NOT_MATCH_SHOP");

            if (!compareSync(psw, user.secret))
                throw new Error("INVALID_PASSWORD");

            // Generate token
            const content: UserIdentity = {
                id: user.id,
                username: user.username,
                generated: new Date().toISOString(),
                n_v: randomUUID().replace("-", ""),
                shop: shopId ? currentShop?.shop?.id : null,
                roles: shopId
                    ? currentShop?.roles.map((item) => item.role.title)
                    : [],
            };

            const token = this.jwtService.sign(content, {
                expiresIn: "7d",
                secret: this.configService.get<string>("JWT_SECRET"),
            });

            return token;
        } catch (error) {
            throw new HttpException(
                "IDENTIFIANT_INVALID",
                HttpStatus.UNAUTHORIZED
            );
        }
    }

    async signup(
        payload: CreateUserDto,
        credential: string
    ): Promise<UserEntity> {
        const [username, psw] = this.extractBasicCredential(credential);
        const user = await this.userService.createUser({
            ...payload,
            username,
            secret: await this.hashSecret(psw),
        });

        try {
            return await this.userService.getUserById(user.id);
        } catch (error) {
            throw new HttpException(
                "USERNAME_ALREADY_EXIST",
                HttpStatus.CONFLICT
            );
        }
    }

    extractBasicCredential(authorization: string) {
        const basic = authorization.replace(/^Basic /, "");
        const [credential, psw] = Buffer.from(basic, "base64")
            .toString("utf-8")
            .split(":", 2);
        if (!credential || !psw)
            throw new HttpException("NO_CREDENTIAL", HttpStatus.BAD_REQUEST);

        return [credential, psw];
    }
}
