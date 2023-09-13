import {
    ArrayNotEmpty,
    IsArray,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
    isDate,
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

class FindOrderQueryDto {
    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/)
    begin: string;

    @IsOptional()
    @Matches(/^\d{4}-\d{2}-\d{2}$/)
    end: string;

    isValideDate() {
        const begin = this.begin;
        const end = this.end;
        try {
            if (!!begin && !isDate(new Date(begin))) return false;
            if (!!end && !isDate(new Date(end))) return false;
            return true;
        } catch (error) {
            return false;
        }
    }
}

export { FindOrderQueryDto, ResquestOrderDto, SaveLocalOrderDto };
