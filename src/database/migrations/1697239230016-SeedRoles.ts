import { RoleEntity, RoleType } from "@/modules/user/user.entity";
import { MigrationInterface, QueryRunner } from "typeorm";
export class SeedRoles1697239230016 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await this.createOtherRole(queryRunner);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await this.deleteOtherRole(queryRunner);
    }

    async createOtherRole(queryRunner: QueryRunner): Promise<RoleEntity[]> {
        const data = [
            {
                title: RoleType.UPDATE_USER,
                description: "Peut gérer les utilisateurs",
            },
            {
                title: RoleType.UPDATE_PRODUCT,
                description: "Peut modifier ou ajouter des produits",
            },
            {
                title: RoleType.UPDATE_ORDER,
                description:
                    "Peut changer les status ou suprimer des commandes",
            },
            {
                title: RoleType.STAFF,
                description:
                    "Personnel simple, peut acceder à toutes les données en lecture seul",
            },
        ];
        const result = await queryRunner.manager
            .getRepository<RoleEntity>(RoleEntity)
            .findBy(data.map((item) => ({ title: item.title })));

        return Promise.all(
            data.map(async (toAdd) => {
                let current = result.find((item) => item.title == toAdd.title);
                if (!current) {
                    current = new RoleEntity();
                    current.title = toAdd.title;
                    current.description = toAdd.description;
                    await queryRunner.manager
                        .getRepository(RoleEntity)
                        .save(current);
                }
                return current;
            })
        );
    }
    async deleteOtherRole(queryRunner: QueryRunner): Promise<RoleEntity[]> {
        const data = [
            {
                title: RoleType.UPDATE_USER,
                description: "Peut gérer les utilisateurs",
            },
            {
                title: RoleType.UPDATE_PRODUCT,
                description: "Peut modifier ou ajouter des produits",
            },
            {
                title: RoleType.UPDATE_ORDER,
                description:
                    "Peut changer les status ou suprimer des commandes",
            },
            {
                title: RoleType.STAFF,
                description:
                    "Personnel simple, peut acceder à toutes les données en lecture seul",
            },
        ];
        const roles = await queryRunner.manager
            .getRepository<RoleEntity>(RoleEntity)
            .findBy(data.map((item) => ({ title: item.title })));
        return queryRunner.manager.getRepository(RoleEntity).remove(roles);
    }
}
