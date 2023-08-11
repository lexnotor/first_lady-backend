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
    quantity = 0;

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

class CreateVersionDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    title: string;

    @IsNotEmpty()
    @IsString()
    @IsUUID()
    product: string;

    @IsOptional()
    @IsString()
    description: string;

    @IsOptional()
    @IsNumber()
    quantity = 0;

    @IsOptional()
    @IsNumber()
    price = 0;

    getVersion(): ProductVersionInfo {
        return {
            price: this.price,
            quantity: this.quantity,
            title: this.title,
            description: this.description,
        };
    }

    getproduct(): string {
        return this.product;
    }
}

class FindProductDto {
    @IsOptional()
    @IsString()
    text: string;

    @IsOptional()
    @IsString()
    @IsUUID()
    id: string;

    @IsOptional()
    @IsNumber()
    page = 1;
}

class FindCategoryDto {
    @IsOptional()
    @IsString()
    shop: string;

    @IsOptional()
    @IsString()
    text: string;

    @IsOptional()
    @IsString()
    @IsUUID()
    id: string;

    @IsOptional()
    @IsNumber()
    page = 1;
}

export {
    CreateCategoryDto,
    CreateProductDto,
    UpdateCategoryDto,
    UpdateProductDto,
    FindCategoryDto,
    FindProductDto,
    CreateVersionDto,
};
