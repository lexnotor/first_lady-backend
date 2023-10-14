import {
    IsEmail,
    IsEmpty,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
} from "class-validator";
import { RoleType } from "./user.entity";

class CreateUserDto {
    // required
    @IsEmpty()
    username: string;

    @IsEmpty()
    secret: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    names: string;

    // required
    @IsOptional()
    @IsString()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    address: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    bank: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    birth: string;
}

class UpdateUserDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    address: string;

    @IsOptional()
    @IsEmail()
    @IsString()
    email: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    names: string;
}

class CreateRoleDto {
    @IsNotEmpty()
    @IsEnum(RoleType)
    title: RoleType;

    @IsOptional()
    @IsString()
    description = "";
}

class UpdateRoleDto {
    @IsOptional()
    @IsString()
    description: string;
}

export { CreateUserDto, UpdateUserDto, CreateRoleDto, UpdateRoleDto };
