import { ShopInfo } from "@/index";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ShopEntity } from "./shop.entity";

@Injectable()
export class ShopService {
    constructor(
        @InjectRepository(ShopEntity)
        private readonly shopRepo: Repository<ShopEntity>
    ) {}

    async createShop(payload: ShopInfo): Promise<ShopEntity> {
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

    async getShopById(): Promise<ShopEntity> {
        return null;
    }
}
