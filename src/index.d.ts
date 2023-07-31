export type ApiResponse<T = object> = {
    message: string;
    data?: T;
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
    users?: UserShopInfo[];
}

export interface UserInfo extends DefaultInfo {
    names?: string;
    username: ?string;
    email?: string;
    secret?: string;
    birth?: string;
    address?: string;
    bank?: string;
    shops?: UserShopInfo[];
}

export interface UserShopInfo extends DefaultInfo {
    user?: UserInfo;
    shop?: ShopInfo;
    roles?: UserShopRoleInfo[];
}

export interface RoleInfo extends DefaultInfo {
    title?: string;
    description?: string;
    user_shops?: UserShopRoleInfo[];
}

export interface UserShopRoleInfo extends DefaultInfo {
    role?: RoleInfo;
    user_shop?: UserShopInfo;
}
