import { DefaultEntity } from "@/utils/entity";
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryColumn,
    Relation,
} from "typeorm";
import { VersionPhotoEntity } from "../photo/photo.entity";
import { ShopEntity } from "../shop/shop.entity";

@Entity("products")
class ProductEntity extends DefaultEntity {
    @Column({ nullable: false })
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    brand: string;

    @Column({ default: 0, nullable: true })
    sales: number;

    @ManyToOne(() => ShopEntity)
    @JoinColumn({ name: "shop_id" })
    shop?: Relation<ShopEntity>;

    @ManyToOne(() => CategoryEntity)
    @JoinColumn({ name: "category_id" })
    category?: Relation<CategoryEntity>;

    @OneToMany(() => ProductVersionEntity, (product_v) => product_v.product)
    product_v: Relation<ProductVersionEntity[]>;
}

@Entity("categories")
class CategoryEntity extends DefaultEntity {
    @Column({ nullable: false })
    title: string;

    @Column({ nullable: true })
    description: string;

    @ManyToOne(() => ShopEntity)
    @JoinColumn({ name: "shop_id" })
    shop?: Relation<ShopEntity>;
}

@Entity("product_versions")
class ProductVersionEntity extends DefaultEntity {
    @PrimaryColumn()
    key_id: string;

    @Column({ nullable: false })
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: false, default: 0 })
    quantity: number;

    @Column({ nullable: false, default: 0 })
    price: number;

    @ManyToOne(() => VersionPhotoEntity)
    @JoinColumn({ name: "photo_id" })
    photo: Relation<VersionPhotoEntity>;

    @ManyToOne(() => ProductEntity)
    @JoinColumn({ name: "product_id" })
    product: Relation<ProductEntity>;
}

export { CategoryEntity, ProductEntity, ProductVersionEntity };
