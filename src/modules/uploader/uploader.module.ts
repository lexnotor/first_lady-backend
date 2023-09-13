import { Module } from "@nestjs/common";
import { UploaderService } from "./uploader.service";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
    imports: [ConfigModule],
    providers: [UploaderService, ConfigService],
    exports: [UploaderService, ConfigService],
})
export class UploaderModule {}
