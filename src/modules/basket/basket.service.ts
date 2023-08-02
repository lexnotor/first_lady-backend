import { BasketProductInfo } from "@/index";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Equal, FindManyOptions, FindOneOptions, Repository } from "typeorm";
import { ProductVersionEntity } from "../product/product.entity";
import { UserEntity } from "../user/user.entity";
import { BasketEntity, BasketProductEntity } from "./basket.entity";

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

    async addItem(
        payload: BasketProductInfo,
        basket: BasketEntity,
        product_v: ProductVersionEntity
    ): Promise<BasketProductEntity> {
        if (payload.quantity > product_v.quantity)
            throw new Error("OUT_OF_STOCK");

        let basketProduct: BasketProductEntity;
        basketProduct.quantity = payload.quantity;
        basketProduct.basket = basket;
        basketProduct.product_v = product_v;
        basketProduct.product = product_v.product;
        basketProduct.shop = product_v.product.shop;

        try {
            await this.basketProductRepo.save(basketProduct);
        } catch (error) {
            throw new HttpException(
                "BASKET_REQUIMENT_FAIL",
                HttpStatus.BAD_REQUEST
            );
        }

        return basketProduct;
    }

    async updateItem(
        payload: BasketProductInfo,
        product_id: string
    ): Promise<BasketProductEntity> {
        const basketItem = await this.getItemById(product_id);

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

    async getCartById(basketId: string): Promise<BasketEntity> {
        let basket: BasketEntity;

        const filter: FindOneOptions<BasketEntity> = {};
        filter.where = { id: Equal(basketId) };
        filter.select = {
            user: { username: true, id: true },
            created_at: true,
            id: true,
        };
        filter.relations = { user: true };

        try {
            basket = await this.basketRepo.findOneOrFail(filter);
        } catch (error) {
            throw new HttpException("BASKET_NOT_FOUND", HttpStatus.NOT_FOUND);
        }

        return basket;
    }

    async getItemById(item_id: string): Promise<BasketProductEntity> {
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

    async getUserCart(userId: string): Promise<BasketEntity> {
        let basket: BasketEntity;

        const filter: FindOneOptions<BasketEntity> = {};
        filter.where = { user: Equal(userId) };
        filter.select = {
            user: { username: true, id: true },
            created_at: true,
            id: true,
        };
        filter.relations = { user: true };

        try {
            basket = await this.basketRepo.findOneOrFail(filter);
        } catch (error) {
            throw new HttpException("BASKET_NOT_FOUND", HttpStatus.NOT_FOUND);
        }

        return await this.getCartById(basket.id);
    }

    async getCartItems(cartId: string): Promise<BasketProductEntity[]> {
        let items: BasketProductEntity[];
        const filter: FindManyOptions<BasketProductEntity> = {};
        filter.where = { basket: Equal(cartId) };
        filter.select = {
            id: true,
            created_at: true,
            product: { id: true, title: true },
        };
        try {
            items;
        } catch (error) {}

        return null;
    }

    async deleteItem(item_id: string): Promise<string> {
        const item = await this.getItemById(item_id);

        try {
            await this.basketProductRepo.softRemove(item);
        } catch (error) {
            throw new HttpException(
                "ITEM_NOT_DELETED",
                HttpStatus.NOT_MODIFIED
            );
        }

        return item_id;
    }
}
