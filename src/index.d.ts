import { RoleType } from "./modules/user/user.entity";

export type ApiResponse<T = object, D = any> = {
    message: string;
    data?: T;
    extra?: D;
};

export interface DefaultInfo {
    id?: string;
    created_at?: Date;
    deleted_at?: Date;
    updated_at?: Date;
}

export interface ShopInfo extends DefaultInfo {
    title?: string;
    address?: string;
    profile?: string;
    cover?: string;
    users?: UserShopInfo[] | string[];
}

export interface UserInfo extends DefaultInfo {
    names?: string;
    username: ?string;
    email?: string;
    secret?: string;
    birth?: string;
    address?: string;
    bank?: string;
    shops?: UserShopInfo[] | string[];
}

export interface UserShopInfo extends DefaultInfo {
    user?: UserInfo;
    shop?: ShopInfo;
    roles?: UserShopRoleInfo[] | string[];
}

export interface RoleInfo extends DefaultInfo {
    title?: RoleType;
    description?: string;
    user_shops?: UserShopRoleInfo[] | string[];
}

export interface UserShopRoleInfo extends DefaultInfo {
    role?: RoleInfo | string;
    user_shop?: UserShopInfo | string[];
}

export interface ProductInfo extends DefaultInfo {
    title?: string;
    description?: string;
    brand?: string;
    sales?: number;
    shop?: ShopInfo | string;
    category?: CategoryInfo | string;
    product_v?: ProductVersionInfo[] | string[];
}
export interface ProductVersionInfo extends DefaultInfo {
    title?: string;
    description?: string;
    quantity?: number;
    price?: number;
    key_id?: string;
    product?: ProductInfo | string;
    photo?: VersionPhotoInfo;
}
export interface VersionPhotoInfo extends DefaultInfo {
    photo?: PhotoInfo;
    products_v?: ProductVersionInfo[];
}
export interface PhotoInfo extends DefaultInfo {
    link?: string;
    description?: string;
    meta: string;
}
export interface CategoryInfo extends DefaultInfo {
    title?: string;
    description?: string;
    shop?: ShopInfo | string;
}

export interface CartInfo extends DefaultInfo {
    user?: UserInfo | string;
}
export interface CartProductInfo extends DefaultInfo {
    quantity?: number;
    shop?: ShopInfo | string;
    product?: ProductInfo | string;
    product_v?: ProductVersionInfo | string;
}

export interface ProductStats {
    total_product: number;
    total_variant: number;
    total_category: number;
    product_without_category: number;
    product_out_of_stock: number;
    total_order: number;
    total_insitu: number;
    total_delivery: number;
}

export interface CategoryStats {
    id: string;
    products: string;
    title: string;
}

enum OrderType {
    INSITU = "SURPLACE",
    DELIVERY = "ADELIVRER",
}
enum OrderState {
    DONE = "TERMINER",
    PENDING = "EN_COURS",
    ERROR = "ERREUR",
}
export interface OrderInfo extends DefaultInfo {
    type: OrderType;
    address: string;
    date: Date;
    paid: boolean;
    state: OrderState;
    user: UserInfo | string;
    shop: ShopInfo | string;
    products: OrderProductInfo[] | string[];
}

export interface OrderProductInfo extends DefaultInfo {
    order: OrderInfo | string[];
    product_v: ProductVersionInfo | string[];
    product: ProductInfo | string[];
    quantity: number;
}

export interface FileMeta {
    size: number;
    filename: string;
    url: string;
    mimetype: string;
    public_id?: string;
    format?: string;
    type?: string;
}
