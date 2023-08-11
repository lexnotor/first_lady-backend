import { IsInt, IsNotEmpty, IsUUID } from "class-validator";

class AddItemDto {
    @IsNotEmpty()
    @IsInt()
    quantity: number;

    @IsNotEmpty()
    @IsUUID()
    product_v: string;
}

class UpdateItemDto {
    @IsNotEmpty()
    @IsInt()
    quantity: number;
}

export { AddItemDto, UpdateItemDto };
