import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BasketEntity, BasketProductEntity } from "./basket.entity";
import { Equal, FindOneOptions, Repository } from "typeorm";
import { UserEntity } from "../user/user.entity";
import { BasketProductInfo } from "@/index";

@Injectable()
export class BasketService {
    constructor(
        @InjectRepository(BasketEntity)
        private readonly basketRepo: Repository<BasketEntity>,
        @InjectRepository(BasketProductEntity)
        private readonly basketProductRepo: Repository<BasketProductEntity>
    ) {}

    async createBasket(user: UserEntity): Promise<BasketEntity> {
        const basket = new BasketEntity();
        basket.user = user;

        try {
            await this.basketRepo.save(basket);
        } catch (error) {
            throw new HttpException(
                "BASKET_REQUIREMENT_FAIL",
                HttpStatus.BAD_REQUEST
            );
        }

        return basket;
    }

    // TODO
    async addProduct(): Promise<BasketProductEntity> {
        return null;
    }

    async updateBasketProduct(
        payload: BasketProductInfo,
        product_id: string
    ): Promise<BasketProductEntity> {
        const basketItem = await this.getBasketProductById(product_id);

        basketItem.quantity = payload.quantity ?? basketItem.quantity;

        try {
            await this.basketProductRepo.save(basketItem);
        } catch (error) {
            throw new HttpException(
                "ITEM_NOT_MODIFIED",
                HttpStatus.NOT_MODIFIED
            );
        }

        return basketItem;
    }

    async getBasketById(basketId: string): Promise<BasketEntity> {
        let basket: BasketEntity;

        const filter: FindOneOptions<BasketEntity> = {};
        filter.where = { id: Equal(basketId) };

        try {
            basket = await this.basketRepo.findOneOrFail(filter);
        } catch (error) {
            throw new HttpException("BASKET_NOT_FOUND", HttpStatus.NOT_FOUND);
        }

        return basket;
    }

    async getBasketProductById(item_id: string): Promise<BasketProductEntity> {
        let product: BasketProductEntity;
        const filter: FindOneOptions<BasketProductEntity> = {};

        filter.where = { id: Equal(item_id) };
        filter.relations = {
            basket: { user: true },
            product: true,
            product_v: true,
        };
        filter.select = {
            id: true,
            basket: { user: { id: true } },
            created_at: true,
            product: { title: true, id: true },
            quantity: true,
            product_v: { id: true, title: true },
        };

        try {
            product = await this.basketProductRepo.findOneOrFail(filter);
        } catch (error) {
            throw new HttpException("ITEM_NOT_FOUND", HttpStatus.NOT_FOUND);
        }
        return product;
    }

    // TODO
    async deleteProduct(): Promise<BasketEntity> {
        return null;
    }
}
