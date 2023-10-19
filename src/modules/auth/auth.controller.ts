import { ApiResponse, UserInfo } from "@/index";
import {
    Body,
    Controller,
    Get,
    Headers,
    HttpException,
    HttpStatus,
    Post,
    UseGuards,
} from "@nestjs/common";
import { isEmpty, isString, isUUID, matches } from "class-validator";
import { SignupUserDto } from "../user/user.dto";
import { User, UserIdentity } from "./auth.decorator";
import { AuthGuard } from "./auth.guard";
import { AuthService } from "./auth.service";

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("login")
    async login(
        @Headers("authorization") credential: string,
        @Body("shop") shopId: string
    ): Promise<ApiResponse<string>> {
        if (shopId && !isUUID(shopId))
            throw new HttpException("INVALID_SHOP", HttpStatus.BAD_REQUEST);

        // check the password
        if (
            isEmpty(credential) ||
            !isString(credential) ||
            !matches(credential, /^Basic/i)
        )
            throw new HttpException(
                "INVALID_CREDENTIAL",
                HttpStatus.BAD_REQUEST
            );

        return {
            message: "SUCCES_LOGGED",
            data: await this.authService.basicLogin(
                credential,
                undefined,
                shopId
            ),
        };
    }

    @Post("signup")
    async signup(
        @Body() payload: SignupUserDto,
        @Headers("authorization") credential: string
    ): Promise<ApiResponse<UserInfo>> {
        // check the password
        if (
            isEmpty(credential) ||
            !isString(credential) ||
            !matches(credential, /^Basic/i)
        )
            throw new HttpException(
                "INVALID_PASSWORD_USERNAME",
                HttpStatus.BAD_REQUEST
            );
        return {
            message: "SUCCES_SIGNUP",
            data: await this.authService.signup(payload, credential),
        };
    }

    @Get("islogin")
    @UseGuards(AuthGuard)
    async verify(@User() user: UserIdentity) {
        return {
            data: user,
        };
    }
}
