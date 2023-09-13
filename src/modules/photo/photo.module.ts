import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UploaderModule } from "../uploader/uploader.module";
import { PhotoController } from "./photo.controller";
import { PhotoEntity, VersionPhotoEntity } from "./photo.entity";
import { PhotoService } from "./photo.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([PhotoEntity, VersionPhotoEntity]),
        UploaderModule,
    ],
    controllers: [PhotoController],
    providers: [PhotoService],
    exports: [PhotoService],
})
export class PhotoModule {}
