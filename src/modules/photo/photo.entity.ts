import { DefaultEntity } from "@/utils/entity";
import { Column, Entity, ManyToOne, OneToMany, Relation } from "typeorm";
import { ProductVersionEntity } from "../product/product.entity";

@Entity("photos")
class PhotoEntity extends DefaultEntity {
    @Column()
    link: string;

    @Column({ nullable: true })
    description: string;

    @Column("text")
    meta: string;
}

@Entity("product_v_photos")
class VersionPhotoEntity extends DefaultEntity {
    @ManyToOne(() => PhotoEntity)
    photo: Relation<PhotoEntity>;

    @OneToMany(() => ProductVersionEntity, (ver) => ver.photo)
    products_v: Relation<ProductVersionEntity[]>;
}

/**{ referencedColumnName: "id", name: "product_v_id" },
        { referencedColumnName: "key_id", name: "product_v_key" }, */
export { PhotoEntity, VersionPhotoEntity };
