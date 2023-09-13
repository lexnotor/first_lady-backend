import { CategoryInfo, ProductInfo, ProductVersionInfo } from "@/index";
import {
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
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
    title?: string;

    // optional
    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    brand?: string;

    @IsOptional()
    @IsNumber()
    sales?: number;

    @IsOptional()
    @IsString()
    @IsUUID()
    category?: string;

    @IsOptional()
    @IsNumber()
    quantity?: number;

    @IsOptional()
    @IsNumber()
    price?: number;

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

class FindProductVersionDto {
    @IsOptional()
    @IsString()
    text?: string;

    @IsOptional()
    @IsString()
    @IsUUID()
    id?: string;

    @IsOptional()
    @Matches(/[0-9]+/i)
    minQty?: number;

    @IsOptional()
    @Matches(/[0-9]+/i)
    maxQty?: number;

    @IsOptional()
    @Matches(/[0-9]+/i)
    minPrice?: number;

    @IsOptional()
    @Matches(/[0-9]+/i)
    maxPrice?: number;

    @IsOptional()
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

class UpdateVerisonDto {
    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsNumber()
    price?: number;

    @IsOptional()
    @IsNumber()
    quantity?: number;
}

class AddPhotoDto {
    @IsOptional()
    @IsUUID()
    productId?: string;

    @IsOptional()
    @IsUUID()
    productVId?: string;
}

export {
    CreateCategoryDto,
    CreateProductDto,
    CreateVersionDto,
    FindCategoryDto,
    FindProductDto,
    FindProductVersionDto,
    UpdateCategoryDto,
    UpdateProductDto,
    AddPhotoDto,
    UpdateVerisonDto,
};
