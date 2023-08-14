import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
    Equal,
    FindManyOptions,
    FindOneOptions,
    Like,
    Repository,
} from "typeorm";
import { CreateShopDto } from "./shop.dto";
import { ShopEntity } from "./shop.entity";

@Injectable()
export class ShopService {
    constructor(
        @InjectRepository(ShopEntity)
        private readonly shopRepo: Repository<ShopEntity>
    ) {}

    async createShop(payload: CreateShopDto): Promise<ShopEntity> {
        const shop = new ShopEntity();
        shop.title = payload.title;
        shop.address = payload.address ?? null;
        shop.cover = payload.cover ?? null;
        shop.profile = payload.profile ?? null;

        try {
            await this.shopRepo.save(shop);
        } catch (error) {
            throw new HttpException(
                "SHOP_REQUIREMENT",
                HttpStatus.NOT_ACCEPTABLE
            );
        }

        return shop;
    }

    async getShopById(id: string): Promise<ShopEntity> {
        let shop: ShopEntity;
        const filter: FindOneOptions = {};
        filter.where = { id: Equal(id) };

        try {
            shop = await this.shopRepo.findOneOrFail(filter);
        } catch (error) {
            throw new HttpException("SHOP_NOT_FOUND", HttpStatus.NOT_FOUND);
        }

        return shop;
    }

    async findShop(text: string): Promise<ShopEntity[]> {
        let shops: ShopEntity[];
        const filter: FindManyOptions<ShopEntity> = {};
        filter.where = [{ title: Like(`%${text ?? ""}%`) }];
        filter.select = {
            id: true,
            title: true,
            profile: true,
            cover: true,
            created_at: true,
        };
        filter.order = { created_at: "DESC" };

        try {
            shops = await this.shopRepo.find(filter);
        } catch (error) {
            throw new HttpException("NOT_SHOP_FOUND", HttpStatus.NOT_FOUND);
        }

        return shops;
    }

    async loadShopStat() {
        const stats = {};

        return stats;
    }
}
