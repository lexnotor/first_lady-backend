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
    INSITU = "INSITU",
    DELIVERY = "DELIVERY",
}
enum OrderState {
    DONE = "DONE",
    PENDING = "PENDING",
    ERROR = "ERROR",
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
    order: Relation<OrderEntity>;

    @ManyToOne(() => ProductVersionEntity)
    product_v: Relation<ProductVersionEntity>;

    @ManyToOne(() => ProductEntity)
    product: Relation<ProductEntity>;

    @Column()
    quantity: number;
}

export { OrderEntity, OrderProductEntity, OrderType, OrderState };
