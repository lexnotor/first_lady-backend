import { DefaultEntity } from "@/utils/entity";
import { Column, Entity, ManyToOne, Relation } from "typeorm";
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
    shop?: Relation<ShopEntity>;

    @ManyToOne(() => CategoryEntity)
    category?: Relation<CategoryEntity>;
}

@Entity("categories")
class CategoryEntity extends DefaultEntity {
    @Column({ nullable: false })
    title: string;

    @Column({ nullable: true })
    description: string;

    @ManyToOne(() => ShopEntity)
    shop?: Relation<ShopEntity>;
}

export { CategoryEntity, ProductEntity };
