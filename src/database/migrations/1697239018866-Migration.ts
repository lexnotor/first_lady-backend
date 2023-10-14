import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1697239018866 implements MigrationInterface {
    name = "Migration1697239018866";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "tokens" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "content" character varying NOT NULL,
                "data" jsonb NOT NULL DEFAULT '{}',
                "expire_at" TIMESTAMP,
                "status" character varying NOT NULL DEFAULT 'ACTIVE',
                "userId" uuid,
                CONSTRAINT "PK_3001e89ada36263dabf1fb6210a" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "tokens"
            ADD CONSTRAINT "FK_d417e5d35f2434afc4bd48cb4d2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "tokens" DROP CONSTRAINT "FK_d417e5d35f2434afc4bd48cb4d2"
        `);
        await queryRunner.query(`
            DROP TABLE "tokens"
        `);
    }
}
