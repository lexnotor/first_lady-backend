import { Type } from "class-transformer";
import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsUUID,
    ValidateIf,
} from "class-validator";

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

class RemoveItemDto {
    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    all: boolean;

    @IsOptional()
    @IsUUID()
    @ValidateIf((dto) => dto.all == undefined, {
        message: "itemId and all must be use separatly",
    })
    itemId: string;
}

export { AddItemDto, UpdateItemDto, RemoveItemDto };
