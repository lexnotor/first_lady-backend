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
                description: "This one can manage other user",
            },
            {
                title: RoleType.UPDATE_PRODUCT,
                description: "This one can update product",
            },
            {
                title: RoleType.UPDATE_ORDER,
                description: "This one can change order status, or delete",
            },
            {
                title: RoleType.SELLER,
                description: "This one can change save local order",
            },
            {
                title: RoleType.STAFF,
                description: "This one can just access all data",
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
                description: "This one can manage other user",
            },
            {
                title: RoleType.UPDATE_PRODUCT,
                description: "This one can update product",
            },
            {
                title: RoleType.UPDATE_ORDER,
                description: "This one can change order status, or delete",
            },
            {
                title: RoleType.SELLER,
                description: "This one can change save local order",
            },
            {
                title: RoleType.STAFF,
                description: "This one can just access all data",
            },
        ];
        const roles = await queryRunner.manager
            .getRepository<RoleEntity>(RoleEntity)
            .findBy(data.map((item) => ({ title: item.title })));
        return queryRunner.manager.getRepository(RoleEntity).remove(roles);
    }
}
