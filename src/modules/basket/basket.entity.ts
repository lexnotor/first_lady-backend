import { DefaultEntity } from "@/utils/entity";
import { Column, Entity, JoinColumn, ManyToOne, Relation } from "typeorm";
import { ProductEntity, ProductVersionEntity } from "../product/product.entity";
import { ShopEntity } from "../shop/shop.entity";
import { UserEntity } from "../user/user.entity";

@Entity("baskets")
class BasketEntity extends DefaultEntity {
    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: "user_id" })
    user: Relation<UserEntity>;
}

class BasketProductEntity extends DefaultEntity {
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
}

export { BasketEntity, BasketProductEntity };
