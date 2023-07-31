import { ApiResponse, UserInfo } from "@/index";
import {
    Body,
    Controller,
    Headers,
    HttpException,
    HttpStatus,
    Post,
} from "@nestjs/common";
import { isEmpty, isString, matches } from "class-validator";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "../user/user.dto";

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("login")
    async login(
        @Headers("authorization") credential: string
    ): Promise<ApiResponse<string>> {
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
            data: await this.authService.basicLogin(credential),
        };
    }

    @Post("signup")
    async signup(
        @Body() payload: CreateUserDto,
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
}
