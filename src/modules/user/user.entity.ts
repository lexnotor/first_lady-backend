import { DefaultEntity } from "@/utils/entity";
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    Relation,
} from "typeorm";
import { ShopEntity } from "../shop/shop.entity";

export enum RoleType {
    OWNER = "OWNER",
    UPDATE_USER = "UPDATE_USER",
    UPDATE_PRODUCT = "UPDATE_PRODUCT",
    UPDATE_ORDER = "UPDATE_ORDER",
    STAFF = "STAFF",
}

/**
 * Define a user in database
 */
@Entity("users")
class UserEntity extends DefaultEntity {
    @Column()
    names: string;

    @Column({ unique: true })
    username: string;

    @Column({ nullable: true })
    email: string;

    @Column({ select: false })
    secret: string;

    @Column({ nullable: true })
    birth: string;

    @Column({ nullable: true })
    address: string;

    @Column({ nullable: true })
    bank: string;

    @OneToMany(() => UserShopEntity, (shop) => shop.user)
    shops?: Relation<UserShopEntity[]>;

    @OneToMany(() => TokenEntity, (token) => token.user, { cascade: true })
    tokens?: Relation<TokenEntity[]>;
}

/**
 * Define the relation between a user and a shop
 */
@Entity("user_shops")
class UserShopEntity extends DefaultEntity {
    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: "user_id" })
    user: Relation<UserEntity>;

    @ManyToOne(() => ShopEntity)
    @JoinColumn({ name: "shop_id" })
    shop: Relation<ShopEntity>;

    @OneToMany(() => UserShopRoleEntity, (role) => role.user_shop)
    roles: Relation<UserShopRoleEntity[]>;
}

/**
 * Define the role of user in the shop
 */
@Entity("user_shop_roles")
class UserShopRoleEntity extends DefaultEntity {
    @ManyToOne(() => RoleEntity)
    @JoinColumn({ name: "role_id" })
    role: Relation<RoleEntity>;

    @ManyToOne(() => UserShopEntity)
    @JoinColumn({ name: "user_shop_id" })
    user_shop: Relation<UserShopEntity>;
}

/**
 * Define all roles that an user can have
 *
 * Ex: __`OWNER`__, __`ADMIN`__, __`SALER`__
 */
@Entity("roles")
class RoleEntity extends DefaultEntity {
    @Column({ unique: true, enum: RoleType })
    title: RoleType;

    @Column()
    description: string;

    @OneToMany(() => UserShopRoleEntity, (user_shop) => user_shop.role, {
        cascade: true,
    })
    user_shops?: Relation<UserShopRoleEntity[]>;
}

@Entity("tokens")
class TokenEntity extends DefaultEntity {
    @ManyToOne(() => UserEntity, (user) => user.tokens)
    user: Relation<UserEntity>;

    @Column()
    content: string;

    @Column("jsonb", { default: {} })
    data: object;

    @Column("timestamp", { nullable: true, default: null })
    expire_at: Date;

    @Column({ default: "ACTIVE", nullable: false })
    status: "ACTIVE" | "INACTIVE";
}

export {
    RoleEntity,
    UserEntity,
    UserShopEntity,
    UserShopRoleEntity,
    TokenEntity,
};
