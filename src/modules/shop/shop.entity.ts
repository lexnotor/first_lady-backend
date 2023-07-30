import { DefaultEntity } from "@/utils/entity";
import { Column, Entity } from "typeorm";

@Entity("shops")
class ShopEntity extends DefaultEntity {
    @Column()
    title: string;

    @Column()
    address: string;

    @Column({ default: null, nullable: true })
    profile: string;

    @Column({ default: null, nullable: true })
    cover: string;
}

export { ShopEntity };
