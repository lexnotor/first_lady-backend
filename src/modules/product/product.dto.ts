import { CategoryInfo, ProductInfo, ProductVersionInfo } from "@/index";
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    MinLength,
} from "class-validator";

class CreateProductDto {
    // required
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    title: string;

    @IsNotEmpty()
    @IsString()
    @IsUUID()
    shop: string;

    // optional
    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    brand: string;

    @IsOptional()
    @IsNumber()
    sales = 0;

    @IsOptional()
    @IsString()
    @IsUUID()
    category: string;

    @IsOptional()
    @IsNumber()
    quantity: number;

    @IsOptional()
    @IsNumber()
    price = 0;

    getProduct(): ProductInfo {
        return {
            title: this.title,
            description: this.description,
            brand: this.brand,
            sales: this.sales,
        };
    }

    getProduct_v(): ProductVersionInfo {
        return {
            quantity: this.quantity,
            price: this.price,
        };
    }

    getShopId(): string {
        return this.shop;
    }

    getCategoryId(): string {
        return this.category;
    }
}

class UpdateProductDto {
    // required
    @IsOptional()
    @IsString()
    @MinLength(3)
    title: string;

    // optional
    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    brand: string;

    @IsOptional()
    @IsNumber()
    sales: number;

    @IsOptional()
    @IsString()
    @IsUUID()
    category: string;

    @IsOptional()
    @IsUUID()
    key_id: string;

    @IsOptional()
    @IsNumber()
    quantity: number;

    @IsOptional()
    @IsNumber()
    price: number;

    getProduct(): ProductInfo {
        return {
            title: this.title,
            description: this.description,
            brand: this.brand,
            sales: this.sales,
            category: this.category as any,
        };
    }

    getProduct_v(): ProductVersionInfo {
        return {
            quantity: this.quantity,
            price: this.price,
            key_id: this.key_id,
        };
    }

    getCategoryId(): string {
        return this.category;
    }
}

class CreateCategoryDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    title: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    description: string;

    @IsNotEmpty()
    @IsString()
    @IsUUID()
    shop: string;

    getCategory(): CategoryInfo {
        return {
            title: this.title,
            description: this.description,
        };
    }
}

class UpdateCategoryDto {
    @IsOptional()
    @IsString()
    @MinLength(3)
    title: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    description: string;
}

export {
    CreateCategoryDto,
    CreateProductDto,
    UpdateCategoryDto,
    UpdateProductDto,
};
