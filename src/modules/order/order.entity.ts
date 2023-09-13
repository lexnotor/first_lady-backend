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
import { UserEntity } from "../user/user.entity";
import { ProductEntity, ProductVersionEntity } from "../product/product.entity";

enum OrderType {
    INSITU = "SURPLACE",
    DELIVERY = "ADELIVRER",
}
enum OrderState {
    DONE = "TERMINER",
    PENDING = "EN_COURS",
    ERROR = "ERREUR",
}

@Entity("orders")
class OrderEntity extends DefaultEntity {
    @Column()
    type: OrderType;

    @Column()
    address: string;

    @Column()
    date: Date;

    @Column()
    paid: boolean;

    @Column()
    state: OrderState;

    @ManyToOne(() => UserEntity)
    @JoinColumn({ name: "user_id" })
    user: Relation<UserEntity>;

    @ManyToOne(() => ShopEntity)
    @JoinColumn({ name: "shop_id" })
    shop: Relation<ShopEntity>;

    @OneToMany(() => OrderProductEntity, (product) => product.order)
    products: Relation<OrderProductEntity[]>;
}

@Entity("order_products")
class OrderProductEntity extends DefaultEntity {
    @ManyToOne(() => OrderEntity)
    @JoinColumn({ name: "oreder_id" })
    order: Relation<OrderEntity>;

    @ManyToOne(() => ProductVersionEntity)
    @JoinColumn([
        { name: "product_v_id", referencedColumnName: "id" },
        { name: "product_v_key", referencedColumnName: "key_id" },
    ])
    product_v: Relation<ProductVersionEntity>;

    @ManyToOne(() => ProductEntity)
    @JoinColumn({ name: "product_id" })
    product: Relation<ProductEntity>;

    @Column()
    quantity: number;
}

@Entity("paiements")
class PaiementEntity extends DefaultEntity {
    @Column()
    session_id: string;

    @Column("json")
    session_data: object;

    @Column("json", { nullable: true, default: null })
    paiement_data: object;

    @Column("json")
    order_data: object;

    @Column({ default: "STRIPE" })
    type: "STRIPE";

    @Column()
    status: string;

    @Column()
    user: string;
}

export {
    OrderEntity,
    OrderProductEntity,
    OrderType,
    OrderState,
    PaiementEntity,
};
