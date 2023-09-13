import { FileMeta } from "@/index";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { isString } from "class-validator";

import { v2 as cloudinary } from "cloudinary";

@Injectable()
export class UploaderService {
    constructor(private readonly configService: ConfigService) {
        cloudinary.config({
            cloud_name: configService.get<string>("CLOUDINARY_NAME"),
            api_key: configService.get<string>("CLOUDINARY_KEY"),
            api_secret: configService.get<string>("CLOUDINARY_SECRET"),
        });
    }

    async uploadFile(file: Express.Multer.File): Promise<FileMeta> {
        if (!isString(file.mimetype) || !/^image/i.test(file.mimetype))
            throw new HttpException("INVALID_IMAGE", HttpStatus.BAD_REQUEST);

        return await this.uploadToCloudinary(file);
    }

    private async uploadToCloudinary(
        file: Express.Multer.File
    ): Promise<FileMeta> {
        try {
            const base64_encoded = file.buffer.toString("base64");
            const remote_file = await cloudinary.uploader.upload(
                `data:${file.mimetype};base64,${base64_encoded}`,
                { folder: "firstlady" }
            );

            return {
                size: remote_file.bytes,
                format: remote_file.format,
                filename: remote_file.original_filename,
                mimetype: `${remote_file.resource_type}/${remote_file.format}`,
                url: remote_file.secure_url,
                public_id: remote_file.public_id,
                type: "cloudinary",
            };
        } catch (error) {
            throw new HttpException("UPLOADING_FAILED", HttpStatus.BAD_REQUEST);
        }
    }
}
