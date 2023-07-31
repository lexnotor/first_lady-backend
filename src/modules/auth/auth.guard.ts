import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { IncomingHttpHeaders } from "http";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}
    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const request = context
            .switchToHttp()
            .getRequest<Request & { user: string }>();

        const token = this.extractJwt(request.headers);

        try {
            if (!token) throw new Error("EXPECTED_TOKEN");
            const user = this.jwtService.verify(token, {
                secret: this.configService.get<string>("JWT_SECRET"),
            });
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
