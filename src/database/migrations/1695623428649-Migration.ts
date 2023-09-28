import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1695623428649 implements MigrationInterface {
    name = "Migration1695623428649";

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "photos" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "link" character varying NOT NULL,
                "description" character varying,
                "meta" text NOT NULL,
                CONSTRAINT "PK_5220c45b8e32d49d767b9b3d725" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "product_v_photos" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "photoId" uuid,
                CONSTRAINT "PK_223f5f87c7a66eebedb0231b1cb" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "names" character varying NOT NULL,
                "username" character varying NOT NULL,
                "email" character varying,
                "secret" character varying NOT NULL,
                "birth" character varying,
                "address" character varying,
                "bank" character varying,
                CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"),
                CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "user_shops" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "user_id" uuid,
                "shop_id" uuid,
                CONSTRAINT "PK_34e6c90ab4019cb7badb154bbac" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "user_shop_roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "role_id" uuid,
                "user_shop_id" uuid,
                CONSTRAINT "PK_c3cafb0d07cd7df4b86755253e1" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "roles" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "title" character varying NOT NULL,
                "description" character varying NOT NULL,
                CONSTRAINT "UQ_08e86fada7ae67b1689f948e83e" UNIQUE ("title"),
                CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "shops" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "title" character varying NOT NULL,
                "address" character varying,
                "profile" character varying,
                "cover" character varying,
                CONSTRAINT "UQ_b4f06a0b1c2387d265fa2284bde" UNIQUE ("title"),
                CONSTRAINT "PK_3c6aaa6607d287de99815e60b96" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "products" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "title" character varying NOT NULL,
                "description" character varying,
                "brand" character varying,
                "sales" integer DEFAULT '0',
                "shop_id" uuid,
                "category_id" uuid,
                CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "categories" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "title" character varying NOT NULL,
                "description" character varying,
                "shop_id" uuid,
                CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "product_versions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "key_id" character varying NOT NULL,
                "title" character varying NOT NULL,
                "description" character varying,
                "quantity" integer NOT NULL DEFAULT '0',
                "price" integer NOT NULL DEFAULT '0',
                "photo_id" uuid,
                "product_id" uuid,
                CONSTRAINT "PK_37374e0c187d2204539a23d56e8" PRIMARY KEY ("id", "key_id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "carts" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "user_id" uuid,
                CONSTRAINT "REL_2ec1c94a977b940d85a4f498ae" UNIQUE ("user_id"),
                CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "cart_products" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "quantity" integer NOT NULL DEFAULT '0',
                "shop_id" uuid,
                "product_id" uuid,
                "product_v_id" uuid,
                "product_v_key" character varying,
                "cart_id" uuid,
                CONSTRAINT "PK_3b12299e401712e78753a7b4fec" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "orders" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "type" character varying NOT NULL,
                "address" character varying NOT NULL,
                "date" TIMESTAMP NOT NULL,
                "paid" boolean NOT NULL,
                "state" character varying NOT NULL,
                "user_id" uuid,
                "shop_id" uuid,
                CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "order_products" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "quantity" integer NOT NULL,
                "oreder_id" uuid,
                "product_v_id" uuid,
                "product_v_key" character varying,
                "product_id" uuid,
                CONSTRAINT "PK_3e59f094c2dc3310d585216a813" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "paiements" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "session_id" character varying NOT NULL,
                "session_data" json NOT NULL,
                "paiement_data" json,
                "order_data" json NOT NULL,
                "type" character varying NOT NULL DEFAULT 'STRIPE',
                "status" character varying NOT NULL,
                "user" character varying NOT NULL,
                CONSTRAINT "PK_d7a1e0ef2ae0e3a50cc4f41c35e" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "product_v_photos"
            ADD CONSTRAINT "FK_16a5c92f00f8c3c5f809b23982d" FOREIGN KEY ("photoId") REFERENCES "photos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_shops"
            ADD CONSTRAINT "FK_d85e27a225502c117e9625df144" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_shops"
            ADD CONSTRAINT "FK_c2428c1415f9d0753d277811fb5" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_shop_roles"
            ADD CONSTRAINT "FK_0761466e29b92d9b945af0b4e5d" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_shop_roles"
            ADD CONSTRAINT "FK_9dee1832963950fb011544e2128" FOREIGN KEY ("user_shop_id") REFERENCES "user_shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "products"
            ADD CONSTRAINT "FK_9e952e93f369f16e27dd786c33f" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "products"
            ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "categories"
            ADD CONSTRAINT "FK_b7782b67d6bffd48a980289eee1" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "product_versions"
            ADD CONSTRAINT "FK_748781e2bad06cde6e3572ef1b3" FOREIGN KEY ("photo_id") REFERENCES "product_v_photos"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "product_versions"
            ADD CONSTRAINT "FK_f01d66474378b5aff362e6b0e89" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "carts"
            ADD CONSTRAINT "FK_2ec1c94a977b940d85a4f498aea" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_products"
            ADD CONSTRAINT "FK_67d2982f7a4a57768fbdd213b26" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_products"
            ADD CONSTRAINT "FK_bb7910594db3f08cadeb6f484c1" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_products"
            ADD CONSTRAINT "FK_50bfadd13f7cb38550a2b68fa66" FOREIGN KEY ("product_v_id", "product_v_key") REFERENCES "product_versions"("id", "key_id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_products"
            ADD CONSTRAINT "FK_ebc4fe8eabf38786bb86cda0b9f" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "orders"
            ADD CONSTRAINT "FK_a922b820eeef29ac1c6800e826a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "orders"
            ADD CONSTRAINT "FK_33f20db82908f7685a5c0c58ac6" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "order_products"
            ADD CONSTRAINT "FK_f1fc4813141e6bcf536ecfaf8e3" FOREIGN KEY ("oreder_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "order_products"
            ADD CONSTRAINT "FK_525d60f912ab93f545a7b46b8b0" FOREIGN KEY ("product_v_id", "product_v_key") REFERENCES "product_versions"("id", "key_id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "order_products"
            ADD CONSTRAINT "FK_2d58e8bd11dc840b39f99824d84" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "order_products" DROP CONSTRAINT "FK_2d58e8bd11dc840b39f99824d84"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_products" DROP CONSTRAINT "FK_525d60f912ab93f545a7b46b8b0"
        `);
        await queryRunner.query(`
            ALTER TABLE "order_products" DROP CONSTRAINT "FK_f1fc4813141e6bcf536ecfaf8e3"
        `);
        await queryRunner.query(`
            ALTER TABLE "orders" DROP CONSTRAINT "FK_33f20db82908f7685a5c0c58ac6"
        `);
        await queryRunner.query(`
            ALTER TABLE "orders" DROP CONSTRAINT "FK_a922b820eeef29ac1c6800e826a"
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_products" DROP CONSTRAINT "FK_ebc4fe8eabf38786bb86cda0b9f"
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_products" DROP CONSTRAINT "FK_50bfadd13f7cb38550a2b68fa66"
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_products" DROP CONSTRAINT "FK_bb7910594db3f08cadeb6f484c1"
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_products" DROP CONSTRAINT "FK_67d2982f7a4a57768fbdd213b26"
        `);
        await queryRunner.query(`
            ALTER TABLE "carts" DROP CONSTRAINT "FK_2ec1c94a977b940d85a4f498aea"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_versions" DROP CONSTRAINT "FK_f01d66474378b5aff362e6b0e89"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_versions" DROP CONSTRAINT "FK_748781e2bad06cde6e3572ef1b3"
        `);
        await queryRunner.query(`
            ALTER TABLE "categories" DROP CONSTRAINT "FK_b7782b67d6bffd48a980289eee1"
        `);
        await queryRunner.query(`
            ALTER TABLE "products" DROP CONSTRAINT "FK_9a5f6868c96e0069e699f33e124"
        `);
        await queryRunner.query(`
            ALTER TABLE "products" DROP CONSTRAINT "FK_9e952e93f369f16e27dd786c33f"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_shop_roles" DROP CONSTRAINT "FK_9dee1832963950fb011544e2128"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_shop_roles" DROP CONSTRAINT "FK_0761466e29b92d9b945af0b4e5d"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_shops" DROP CONSTRAINT "FK_c2428c1415f9d0753d277811fb5"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_shops" DROP CONSTRAINT "FK_d85e27a225502c117e9625df144"
        `);
        await queryRunner.query(`
            ALTER TABLE "product_v_photos" DROP CONSTRAINT "FK_16a5c92f00f8c3c5f809b23982d"
        `);
        await queryRunner.query(`
            DROP TABLE "paiements"
        `);
        await queryRunner.query(`
            DROP TABLE "order_products"
        `);
        await queryRunner.query(`
            DROP TABLE "orders"
        `);
        await queryRunner.query(`
            DROP TABLE "cart_products"
        `);
        await queryRunner.query(`
            DROP TABLE "carts"
        `);
        await queryRunner.query(`
            DROP TABLE "product_versions"
        `);
        await queryRunner.query(`
            DROP TABLE "categories"
        `);
        await queryRunner.query(`
            DROP TABLE "products"
        `);
        await queryRunner.query(`
            DROP TABLE "shops"
        `);
        await queryRunner.query(`
            DROP TABLE "roles"
        `);
        await queryRunner.query(`
            DROP TABLE "user_shop_roles"
        `);
        await queryRunner.query(`
            DROP TABLE "user_shops"
        `);
        await queryRunner.query(`
            DROP TABLE "users"
        `);
        await queryRunner.query(`
            DROP TABLE "product_v_photos"
        `);
        await queryRunner.query(`
            DROP TABLE "photos"
        `);
    }
}
