import {
    ArrayNotEmpty,
    IsBoolean,
    IsEmail,
    IsEmpty,
    IsEnum,
    IsNotEmpty,
    IsNumberString,
    IsOptional,
    IsString,
    IsUUID,
    MinLength,
} from "class-validator";
import { RoleType } from "./user.entity";
import { Type } from "class-transformer";

class SignupUserDto {
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
class CreateUserDto {
    // required
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    username: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
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

    @IsOptional()
    @IsString()
    @MinLength(6)
    secret: string;

    @IsOptional()
    @IsString()
    oldSecret: string;

    @IsOptional()
    @IsString()
    @IsUUID()
    userId: string;
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

class AssignRoleDto {
    @IsNotEmpty()
    @IsUUID()
    user_id: string;

    @IsUUID(undefined, { each: true })
    roles: RoleType[];
}
class DismissRoleDto {
    @IsNotEmpty()
    @IsUUID()
    user_id: string;

    @ArrayNotEmpty()
    @IsUUID(undefined, { each: true })
    roles: RoleType[];
}

enum UserType {
    CLIENT = "CLIENT",
    STAFF = "STAFF",
}

class FindUserDto {
    @IsOptional()
    @IsEnum(RoleType, { each: true })
    role?: RoleType[];

    @IsOptional()
    @IsString()
    @IsEnum(UserType)
    type?: UserType = UserType.CLIENT;

    @IsOptional()
    @IsUUID()
    user_id?: string;

    @IsOptional()
    @IsString()
    names?: string;

    @IsOptional()
    @IsString()
    username?: string;

    @IsOptional()
    @IsString()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    secret?: string;

    @IsOptional()
    @IsUUID()
    shop_id?: string;

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    exact?: boolean = false;

    @IsOptional()
    @IsNumberString()
    page?: string = "1";
}

export {
    CreateUserDto,
    UpdateUserDto,
    CreateRoleDto,
    UpdateRoleDto,
    AssignRoleDto,
    DismissRoleDto,
    FindUserDto,
    SignupUserDto,
};
