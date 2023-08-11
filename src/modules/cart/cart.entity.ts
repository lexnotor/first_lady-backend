import { DefaultEntity } from "@/utils/entity";
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToOne,
    Relation,
} from "typeorm";
import { ProductEntity, ProductVersionEntity } from "../product/product.entity";
import { ShopEntity } from "../shop/shop.entity";
import { UserEntity } from "../user/user.entity";

@Entity("carts")
class CartEntity extends DefaultEntity {
    @OneToOne(() => UserEntity)
    @JoinColumn({ name: "user_id" })
    user: Relation<UserEntity>;
}

@Entity("cart_products")
class CartProductEntity extends DefaultEntity {
    @Column({ default: 0, nullable: false })
    quantity: number;

    @ManyToOne(() => ShopEntity)
    @JoinColumn({ name: "shop_id" })
    shop: Relation<ShopEntity>;

    @ManyToOne(() => ProductEntity)
    @JoinColumn({ name: "product_id" })
    product: Relation<ProductEntity>;

    @ManyToOne(() => ProductVersionEntity)
    @JoinColumn({ name: "product_v_id" })
    product_v: Relation<ProductVersionEntity>;

    @ManyToOne(() => CartEntity)
    @JoinColumn({ name: "cart_id" })
    cart: Relation<CartEntity>;
}

export { CartEntity, CartProductEntity };
