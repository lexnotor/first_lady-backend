import { DataSource } from "typeorm";
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: "src/database/.env" });

const getPath = (to: string) => path.resolve(process.cwd() + "/" + to);

export const AppDataSource = new DataSource({
    database: process.env.DB_NAME,
    type: "postgres",
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    username: process.env.DB_USERNAME,
    password: process.env.DB_SECRET,
    entities: [getPath("dist/modules/**/*.entity.js")],
    // entities: [__dirname + "/../modules/**/*.entity.ts"],
    synchronize: false,
    migrations: [getPath("dist/database/migrations/*.js")],
});
