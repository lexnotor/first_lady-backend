import { ProductVersionInfo } from "@/index";
import { excludeFrom } from "@/utils/excludeColumnFromEntity";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { randomUUID } from "crypto";
import {
    Between,
    Equal,
    FindManyOptions,
    FindOneOptions,
    ILike,
    Repository,
} from "typeorm";
import { VersionPhotoEntity } from "../photo/photo.entity";
import { PhotoService } from "../photo/photo.service";
import { FindProductVersionDto } from "./product.dto";
import { ProductEntity, ProductVersionEntity } from "./product.entity";

@Injectable()
export class ProductVersionService {
    pageSize = 20;
    constructor(
        @InjectRepository(ProductVersionEntity)
        private readonly product_vRepo: Repository<ProductVersionEntity>,
        @InjectRepository(VersionPhotoEntity)
        private readonly versionPhotoRepo: Repository<VersionPhotoEntity>,
        private readonly photoService: PhotoService
    ) {}

    async createProductVersion(
        payload: ProductVersionInfo,
        product: ProductEntity
    ): Promise<ProductVersionEntity> {
        const product_v = new ProductVersionEntity();

        product_v.description =
            payload.description ?? product.description ?? null;
        product_v.key_id = randomUUID();
        product_v.quantity = payload.quantity ?? 0;
        product_v.price = payload.price ?? 0;
        product_v.title = payload.title ?? "Default";

        product_v.product = product;

        try {
            await this.product_vRepo.save(product_v);
        } catch (error) {
            throw new HttpException(
                "PRODUCT_VERSION_REQUIREMENT_FAIL",
                HttpStatus.BAD_REQUEST
            );
        }
        return product_v;
    }

    async getProductVersionById(
        versionId: string
    ): Promise<ProductVersionEntity> {
        let product_v: ProductVersionEntity;
        const filter: FindOneOptions<ProductVersionEntity> = {};
        filter.where = { id: Equal(versionId) };
        filter.relations = {
            product: { category: true, shop: true },
            photo: { photo: true },
        };
        filter.select = {
            created_at: true,
            description: true,
            id: true,
            key_id: true,
            price: true,
            title: true,
            quantity: true,
        };

        try {
            product_v = await this.product_vRepo.findOneOrFail(filter);
        } catch (error) {
            throw new HttpException(
                `PRODUCT_VERSION_NOT_FOUND ${versionId}`,
                HttpStatus.NOT_FOUND
            );
        }

        return product_v;
    }

    async getProductVersionByKeyId(
        keyId: string
    ): Promise<ProductVersionEntity> {
        let product_v: ProductVersionEntity;
        const filter: FindOneOptions<ProductVersionEntity> = {};
        filter.where = { key_id: Equal(keyId) };
        filter.relations = {
            product: { category: true, shop: true },
            photo: { photo: true },
        };
        filter.select = {
            created_at: true,
            description: true,
            id: true,
            key_id: true,
            price: true,
            product: { title: true, id: true, shop: { id: true, title: true } },
            title: true,
            quantity: true,
        };

        try {
            product_v = await this.product_vRepo.findOneOrFail(filter);
        } catch (error) {
            throw new HttpException(
                "PRODUCT_VERSION_NOT_FOUND",
                HttpStatus.NOT_FOUND
            );
        }

        return product_v;
    }

    async findProductVersion(
        text: string,
        page = 0,
        reqFilters?: Partial<FindProductVersionDto>
    ): Promise<ProductVersionEntity[]> {
        let products_v: ProductVersionEntity[];
        const filter: FindManyOptions<ProductVersionEntity> = {};

        filter.where = reqFilters
            ? [
                  {
                      title: ILike(`%${text ?? ""}%`),
                      quantity: Between(
                          reqFilters.minQty ?? 0,
                          reqFilters.maxQty ?? 9e8
                      ),
                      price: Between(
                          reqFilters.minPrice ?? 0,
                          reqFilters.maxPrice ?? 9e8
                      ),
                      product: {
                          category: reqFilters.categoryId
                              ? Equal(reqFilters.categoryId)
                              : undefined,
                      },
                  },
                  {
                      quantity: Between(
                          reqFilters.minQty ?? 0,
                          reqFilters.maxQty ?? 9e8
                      ),
                      price: Between(
                          reqFilters.minPrice ?? 0,
                          reqFilters.maxPrice ?? 9e8
                      ),
                      product: {
                          category: reqFilters.categoryId
                              ? Equal(reqFilters.categoryId)
                              : undefined,
                          title: ILike(`%${text ?? ""}%`),
                      },
                  },
              ]
            : [
                  { description: ILike(`%${text ?? ""}%`) },
                  { title: ILike(`%${text ?? ""}%`) },
                  { product: { title: ILike(`%${text ?? ""}%`) } },
              ];
        filter.order = { created_at: "DESC" };
        page && (filter.skip = (page - 1) * this.pageSize);
        page && (filter.take = this.pageSize);
        filter.relations = {
            product: { category: true, shop: true },
            photo: { photo: true },
        };

        try {
            products_v = await this.product_vRepo.find(filter);
            if (products_v.length == 0) throw new Error("EMPTY_RESULT");
        } catch (error) {
            throw new HttpException("NO_PRODUCT_FOUND", HttpStatus.NOT_FOUND);
        }

        return excludeFrom(["deleted_at", "updated_at"], products_v);
    }

    async updateProductVersion(
        payload: ProductVersionInfo
    ): Promise<ProductVersionEntity> {
        const product_v = await this.getProductVersionById(payload.id);

        const product_n = new ProductVersionEntity();
        product_n.description = payload.description ?? product_v.description;
        product_n.title = payload.title ?? product_v.title;
        product_n.key_id = product_v.key_id;
        product_n.price = payload.price ?? product_v.price;
        product_n.quantity = payload.quantity ?? product_v.quantity;
        product_n.product = product_v.product;
        product_n.photo = product_v.photo;

        try {
            await this.product_vRepo.softRemove(product_v);
            await this.product_vRepo.save(product_n);
        } catch (error) {
            throw new HttpException(
                "PRODUCT_V_NOT_MODIFIED",
                HttpStatus.NOT_MODIFIED
            );
        }

        return await this.getProductVersionById(product_n.id);
    }

    async addQuantity(
        versionId: string,
        quantity: number,
        price?: number
    ): Promise<ProductVersionEntity> {
        const product_v = await this.getProductVersionById(versionId);

        const newProduct_v = new ProductVersionEntity();

        newProduct_v.description = product_v.description;
        newProduct_v.key_id = product_v.key_id;
        newProduct_v.price = price ?? product_v.price;
        newProduct_v.quantity = +quantity + product_v.quantity;
        newProduct_v.product = product_v.product;
        newProduct_v.title = product_v.title;
        newProduct_v.photo = product_v.photo;

        try {
            await this.product_vRepo.save(newProduct_v);
        } catch (error) {
            throw new HttpException(
                "CANNOT_ADD_QUANTITY",
                HttpStatus.NOT_MODIFIED
            );
        }
        await this.deleteProductVersion(product_v.id);

        return this.getProductVersionById(newProduct_v.id);
    }

    async setPhoto(
        file: Express.Multer.File,
        productVId: string
    ): Promise<ProductVersionEntity> {
        const product_v = await this.updateProductVersion({
            id: productVId,
        });
        const photo = await this.photoService.savePhoto(file);

        const versionPhoto = new VersionPhotoEntity();
        versionPhoto.photo = photo;
        try {
            await this.versionPhotoRepo.save(versionPhoto);
        } catch (error) {
            throw new HttpException(
                "ERROR_TRYING_TO_SAVE_PHOTO_1",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
        product_v.photo = versionPhoto;

        try {
            await this.product_vRepo.save(product_v);
        } catch (error) {
            throw new HttpException(
                "ERROR_TRYING_TO_SAVE_PHOTO_2",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        return this.getProductVersionById(product_v.id);
    }

    async deleteProductVersion(productVId: string): Promise<string> {
        const product_v = await this.getProductVersionById(productVId);

        try {
            await this.product_vRepo.softRemove(product_v);
        } catch (error) {
            throw new HttpException(
                "FAIL_TO_DELETE_PRODUCT_VERSION",
                HttpStatus.NOT_MODIFIED
            );
        }
        return productVId;
    }
}
