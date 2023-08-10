import {
    ArrayNotEmpty,
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
} from "class-validator";
import { OrderType } from "./order.entity";

class ResquestOrderDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    @IsUUID(undefined, { each: true })
    card_product_id: string[];

    @IsNotEmpty()
    @IsString()
    @IsUUID()
    shop_id: string;

    @IsOptional()
    @IsString()
    @IsEnum(OrderType)
    type: OrderType = OrderType.DELIVERY;

    @IsOptional()
    @IsString()
    address = "";
}

class SaveLocalOrderDto {
    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    @IsUUID(undefined, { each: true })
    items_id: string[];
}

export { ResquestOrderDto, SaveLocalOrderDto };
