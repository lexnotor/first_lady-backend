import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from "@nestjs/typeorm";
import * as path from "path";

@Injectable()
export class DbconfigService implements TypeOrmOptionsFactory {
    constructor(private readonly configService: ConfigService) {}

    createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
            database: this.configService.get<string>("DB_NAME"),
            type: "postgres",
            host: this.configService.get<string>("DB_HOST"),
            port: +this.configService.get<string>("DB_PORT"),
            username: this.configService.get<string>("DB_USERNAME"),
            password: this.configService.get<string>("DB_SECRET"),
            autoLoadEntities: true,
            entities: [this.getPath("dist/modules/**/*.entity.js")],
            // entities: [__dirname + "/**/*.entity.ts"],
            synchronize:
                this.configService.get<string>("NODE_ENV") != "production",
        };
    }

    getPath(to: string): string {
        return path.resolve(process.cwd() + "/" + to);
    }
}

//this.configService.get<string>("NODE_ENV") != "production"
