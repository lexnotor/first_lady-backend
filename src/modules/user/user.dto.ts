import {
    IsEmail,
    IsEmpty,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
} from "class-validator";

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
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    title: string;

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
