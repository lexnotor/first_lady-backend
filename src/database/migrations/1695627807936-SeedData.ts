import { CategoryEntity } from "@/modules/product/product.entity";
import { ShopEntity } from "@/modules/shop/shop.entity";
import {
    RoleEntity,
    UserEntity,
    UserShopEntity,
    UserShopRoleEntity,
} from "@/modules/user/user.entity";
import { genSaltSync, hashSync } from "bcrypt";
import * as dotenv from "dotenv";
import * as path from "path";
import { Equal, MigrationInterface, QueryRunner } from "typeorm";

dotenv.config({ path: path.resolve(process.cwd() + "/src/database/.env") });

export class SeedData1695627807936 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const user = await this.createMainUser(queryRunner),
            shop = await this.createMainShop(queryRunner),
            role = await this.createOwnerRole(queryRunner);

        const user_shop = await this.addUserToShop(queryRunner, shop, user);

        await this.assignShopToUser(queryRunner, role, user_shop);
        await this.addMainCategories(queryRunner, shop);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const user = await queryRunner.manager
                .getRepository(UserEntity)
                .findOneBy({ username: "admin" }),
            shop = await queryRunner.manager
                .getRepository<ShopEntity>(ShopEntity)
                .findOneBy({ title: "PREMIERE DAME VLISCO" }),
            role = await queryRunner.manager
                .getRepository<RoleEntity>(RoleEntity)
                .findOneBy({ title: "OWNER" }),
            user_shop = await queryRunner.manager
                .getRepository(UserShopEntity)
                .findOneBy({ shop: Equal(shop?.id), user: Equal(user?.id) });

        await this.deleteMainCategories(queryRunner, shop);
        await this.dismissShopToUser(queryRunner, role, user_shop);
        await this.removeUserFromShop(queryRunner, shop, user);
        await this.deleteMainShop(queryRunner);
        await this.deleteMainUser(queryRunner);
    }

    async createMainUser(queryRunner: QueryRunner): Promise<UserEntity> {
        const user = await queryRunner.manager
            .getRepository(UserEntity)
            .findOneBy({ username: "admin" });

        if (!user) {
            await queryRunner.manager.getRepository(UserEntity).insert({
                email: "admin@admin.com",
                username: "admin",
                address: "PREMIERE DAME",
                names: "Administateur",
                secret: this.hashSecret("@dmin4321"),
            });
        }

        return await queryRunner.manager
            .getRepository(UserEntity)
            .findOneBy({ username: "admin" });
    }
    async deleteMainUser(queryRunner: QueryRunner): Promise<string> {
        const user = await queryRunner.manager
            .getRepository(UserEntity)
            .findOneBy({ username: "admin" });

        if (user) {
            await queryRunner.manager.getRepository(UserEntity).remove(user);
        }

        return user?.id;
    }

    async createOwnerRole(queryRunner: QueryRunner): Promise<RoleEntity> {
        const result = await queryRunner.manager
            .getRepository<RoleEntity>(RoleEntity)
            .findOneBy({ title: "OWNER" });
        if (!result)
            await queryRunner.manager
                .getRepository<RoleEntity>(RoleEntity)
                .insert({
                    title: "OWNER",
                    description: "THE SHOP CREATOR IS THE OWNER",
                });
        return await queryRunner.manager
            .getRepository<RoleEntity>(RoleEntity)
            .findOneBy({ title: "OWNER" });
    }
    async deleteOwnerRole(queryRunner: QueryRunner): Promise<string> {
        const role = await queryRunner.manager
            .getRepository<RoleEntity>(RoleEntity)
            .findOneBy({ title: "OWNER" });
        if (role)
            await queryRunner.manager
                .getRepository<RoleEntity>(RoleEntity)
                .insert({
                    title: "OWNER",
                    description: "THE SHOP CREATOR IS THE OWNER",
                });
        return role?.id;
    }

    async createMainShop(queryRunner: QueryRunner): Promise<ShopEntity> {
        const shop = await queryRunner.manager
            .getRepository<ShopEntity>(ShopEntity)
            .findOneBy({ title: "PREMIERE DAME VLISCO" });
        if (!shop)
            await queryRunner.manager.getRepository(ShopEntity).insert({
                title: "PREMIERE DAME VLISCO",
                address: "RD. Congo, Nord-Kivu, Goma",
                cover: null,
                profile: null,
            });

        return await queryRunner.manager
            .getRepository<ShopEntity>(ShopEntity)
            .findOneBy({ title: "PREMIERE DAME VLISCO" });
    }
    async deleteMainShop(queryRunner: QueryRunner): Promise<string> {
        const shop = await queryRunner.manager
            .getRepository<ShopEntity>(ShopEntity)
            .findOneBy({ title: "PREMIERE DAME VLISCO" });
        if (shop)
            await queryRunner.manager.getRepository(ShopEntity).remove(shop);

        return shop?.id;
    }

    async addUserToShop(
        queryRunner: QueryRunner,
        shop: ShopEntity,
        user: UserEntity
    ): Promise<UserShopEntity> {
        const user_shop = await queryRunner.manager
            .getRepository(UserShopEntity)
            .findOneBy({ shop: Equal(shop?.id), user: Equal(user?.id) });
        if (!user_shop)
            await queryRunner.manager
                .getRepository(UserShopEntity)
                .insert({ shop, user });
        return await queryRunner.manager
            .getRepository(UserShopEntity)
            .findOneBy({ shop: Equal(shop?.id), user: Equal(user?.id) });
    }
    async removeUserFromShop(
        queryRunner: QueryRunner,
        shop: ShopEntity,
        user: UserEntity
    ): Promise<string> {
        const user_shop = await queryRunner.manager
            .getRepository(UserShopEntity)
            .findOneBy({ shop: Equal(shop?.id), user: Equal(user?.id) });
        if (user_shop)
            await queryRunner.manager
                .getRepository(UserShopEntity)
                .remove(user_shop);
        return user_shop?.id;
    }

    async assignShopToUser(
        queryRunner: QueryRunner,
        role: RoleEntity,
        user_shop: UserShopEntity
    ): Promise<UserShopRoleEntity> {
        const user_shop_role = await queryRunner.manager
            .getRepository(UserShopRoleEntity)
            .findOneBy({
                role: Equal(role?.id),
                user_shop: Equal(user_shop?.id),
            });

        if (!user_shop_role)
            await queryRunner.manager
                .getRepository(UserShopRoleEntity)
                .insert({ role, user_shop });

        return await queryRunner.manager
            .getRepository(UserShopRoleEntity)
            .findOneBy({
                role: Equal(role?.id),
                user_shop: Equal(user_shop?.id),
            });
    }
    async dismissShopToUser(
        queryRunner: QueryRunner,
        role: RoleEntity,
        user_shop: UserShopEntity
    ): Promise<string> {
        const user_shop_role = await queryRunner.manager
            .getRepository(UserShopRoleEntity)
            .findOneBy({
                role: Equal(role?.id),
                user_shop: Equal(user_shop?.id),
            });

        if (user_shop_role)
            await queryRunner.manager
                .getRepository(UserShopRoleEntity)
                .remove(user_shop_role);

        return user_shop_role?.id;
    }

    async addMainCategories(queryRunner: QueryRunner, shop: ShopEntity) {
        const data = [
            {
                title: "PRÊT A PORTER",
                description: "Vêtement déjà cousu, et prët à porter",
            },
            {
                title: "SUPERWAX",
                description: "SUPERWAX original, première qualité",
            },
            {
                title: "WOODON",
                description: "Pagne Woodon, Pour modéle Woodon et autre, Wax",
            },
        ];
        const categories = await queryRunner.manager
            .getRepository(CategoryEntity)
            .findBy(
                data.map((item) => ({
                    title: item?.title,
                    shop: Equal(shop?.id),
                }))
            );

        return Promise.all(
            data.map(async (temp) => {
                let current = categories.find(
                    (item) => item?.title == temp?.title
                );

                if (!current) {
                    current = new CategoryEntity();
                    current.title = temp?.title;
                    current.description = temp?.description;
                    current.shop = shop;
                    await queryRunner.manager
                        .getRepository(CategoryEntity)
                        .save(current);
                }

                return current;
            })
        );
    }

    async deleteMainCategories(queryRunner: QueryRunner, shop: ShopEntity) {
        const data = [
            {
                title: "PRÊT A PORTER",
                description: "Vêtement déjà cousu, et prët à porter",
            },
            {
                title: "SUPERWAX",
                description: "SUPERWAX original, première qualité",
            },
            {
                title: "WOODON",
                description: "Pagne Woodon, Pour modéle Woodon et autre, Wax",
            },
        ];
        const categories = await queryRunner.manager
            .getRepository(CategoryEntity)
            .findBy(
                data.map((item) => ({
                    title: item?.title,
                    shop: Equal(shop?.id),
                }))
            );

        await queryRunner.manager
            .getRepository(CategoryEntity)
            .remove(categories);

        return categories?.map((item) => item?.id);
    }

    hashSecret(secret: string) {
        const round = +process.env.SECRET_HASH_ROUND || 10;
        const salt = genSaltSync(round);
        return hashSync(secret, salt);
    }
}
