import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { UploaderService } from "../uploader/uploader.service";
import { InjectRepository } from "@nestjs/typeorm";
import { PhotoEntity } from "./photo.entity";
import { Repository } from "typeorm";

@Injectable()
export class PhotoService {
    constructor(
        @InjectRepository(PhotoEntity)
        private readonly photoRepo: Repository<PhotoEntity>,
        private readonly uploadService: UploaderService
    ) {}

    async savePhoto(file: Express.Multer.File): Promise<PhotoEntity> {
        const meta = await this.uploadService.uploadFile(file);
        const photo = new PhotoEntity();
        photo.link = meta.url;
        photo.meta = JSON.stringify(meta);

        try {
            await this.photoRepo.save(photo);
        } catch (error) {
            throw new HttpException(
                "CANNOT_SAVE_PHOTO",
                HttpStatus.BAD_REQUEST
            );
        }
        return photo;
    }
}
