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

/**
 * Define a user in database
 */
@Entity("users")
class UserEntity extends DefaultEntity {
    @Column()
    names: string;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column()
    secret: string;

    @Column()
    birth: string;

    @Column()
    address: string;

    @Column()
    bank: string;

    @OneToMany(() => UserShopEntity, (shop) => shop.user)
    shops?: Relation<UserShopEntity[]>;
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
    @Column()
    title: string;

    @Column()
    description: string;

    @OneToMany(() => UserShopRoleEntity, (user_shop) => user_shop.role, {
        cascade: true,
    })
    user_shops?: Relation<UserShopRoleEntity[]>;
}

export { RoleEntity, UserEntity, UserShopEntity, UserShopRoleEntity };
