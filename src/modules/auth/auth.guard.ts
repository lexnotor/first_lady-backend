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

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly reflector: Reflector
    ) {}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const requiredRoles =
            this.reflector.getAllAndOverride<string[]>(ROLE_KEY, [
                context.getHandler(),
                context.getClass(),
            ]) || [];

        const request = context
            .switchToHttp()
            .getRequest<Request & { user: UserIdentity }>();

        const token = this.extractJwt(request.headers);

        try {
            if (!token) throw new Error("EXPECTED_TOKEN");
            const user: UserIdentity = this.jwtService.verify(token, {
                secret: this.configService.get<string>("JWT_SECRET"),
            });

            if (
                !requiredRoles.every(
                    (role) => user.roles && user.roles.includes(role)
                )
            ) {
                throw new Error("PERMISSION_DENIED");
            }

            request.user = user;

            return true;
        } catch (error) {
            throw new HttpException("INVALID_TOKEN", HttpStatus.UNAUTHORIZED);
        }
    }

    extractJwt({ authorization }: IncomingHttpHeaders): string {
        if (!authorization) return undefined;

        const [type, token] = authorization.split(" ", 2);
        return type == "Bearer" ? token : undefined;
    }
}
