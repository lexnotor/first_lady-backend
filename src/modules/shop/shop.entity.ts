import { DefaultEntity } from "@/utils/entity";
import { Column, Entity, OneToMany, Relation } from "typeorm";
import { UserShopEntity } from "../user/user.entity";

@Entity("shops")
class ShopEntity extends DefaultEntity {
    @Column({ unique: true })
    title: string;

    @Column()
    address: string;

    @Column({ default: null, nullable: true })
    profile: string;

    @Column({ default: null, nullable: true })
    cover: string;

    @OneToMany(() => UserShopEntity, (userShop) => userShop.shop)
    users?: Relation<UserShopEntity[]>;
}

export { ShopEntity };
