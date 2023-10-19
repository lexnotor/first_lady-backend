import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { IncomingHttpHeaders } from "http";
import { ROLE_KEY, UserIdentity } from "./auth.decorator";
import { RoleType, TokenEntity } from "../user/user.entity";
import { MoreThan, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly reflector: Reflector,
        @InjectRepository(TokenEntity)
        private readonly tokenRepo: Repository<TokenEntity>
    ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Recupere les roles necessair
        const requiredRoles =
            this.reflector.getAllAndOverride<RoleType[]>(ROLE_KEY, [
                context.getHandler(),
                context.getClass(),
            ]) || [];

        // Recupere le contenu de la requette
        const request = context
            .switchToHttp()
            .getRequest<Request & { user: UserIdentity }>();

        // Extrait le contenu du token
        const token = this.extractJwt(request.headers);

        // Verifie s'il y a un token
        if (!token)
            throw new HttpException("SIGNIN_FIRST", HttpStatus.UNAUTHORIZED);

        // Verifions si le jeton est toujours actif, existe dans la BD
        await this.tokenRepo
            .findOneByOrFail({
                content: token,
                status: "ACTIVE",
                expire_at: MoreThan(new Date()),
            })
            .catch(() => {
                throw new HttpException(
                    "UNKNOWN_TOKEN",
                    HttpStatus.UNAUTHORIZED
                );
            });

        // Decode le token
        const user: UserIdentity = await this.jwtService
            .verifyAsync(token, {
                secret: this.configService.get<string>("JWT_SECRET"),
            })
            .catch(() => {
                throw new HttpException(
                    "INVALID_TOKEN",
                    HttpStatus.UNAUTHORIZED
                );
            });

        if (
            !requiredRoles.every((role) => user.roles.includes(role)) &&
            !user.roles.includes(RoleType.OWNER)
        ) {
            throw new HttpException(
                "PERMISSION_DENIED",
                HttpStatus.UNAUTHORIZED
            );
        }

        request.user = user;

        return true;
    }

    extractJwt({ authorization }: IncomingHttpHeaders): string {
        if (!authorization) return undefined;

        const [type, token] = authorization.split(" ", 2);
        return type == "Bearer" ? token : undefined;
    }
}
