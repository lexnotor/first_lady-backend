import { IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";

class CreateShopDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    title: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    address: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    cover: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    profile: string;
}

export { CreateShopDto };
