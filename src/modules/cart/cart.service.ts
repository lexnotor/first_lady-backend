import { CartProductInfo } from "@/index";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Equal, FindManyOptions, FindOneOptions, Repository } from "typeorm";
import { ProductVersionEntity } from "../product/product.entity";
import { UserEntity } from "../user/user.entity";
import { CartEntity, CartProductEntity } from "./cart.entity";

@Injectable()
export class CartService {
    constructor(
        @InjectRepository(CartEntity)
        private readonly cartRepo: Repository<CartEntity>,
        @InjectRepository(CartProductEntity)
        private readonly cartProductRepo: Repository<CartProductEntity>
    ) {}

    async createCart(user: UserEntity): Promise<CartEntity> {
        const cart = new CartEntity();
        cart.user = user;

        try {
            await this.cartRepo.save(cart);
        } catch (error) {
            throw new HttpException(
                "CART_REQUIREMENT_FAIL",
                HttpStatus.BAD_REQUEST
            );
        }

        return cart;
    }

    async addItem(
        payload: CartProductInfo,
        cart: CartEntity,
        product_v: ProductVersionEntity
    ): Promise<CartProductEntity> {
        if (payload.quantity > product_v.quantity)
            throw new Error("OUT_OF_STOCK");

        const cartProduct = new CartProductEntity();
        cartProduct.quantity = payload.quantity;
        cartProduct.cart = cart;
        cartProduct.product_v = product_v;
        cartProduct.product = product_v.product;
        cartProduct.shop = product_v.product.shop;

        try {
            await this.cartProductRepo.save(cartProduct);
        } catch (error) {
            throw new HttpException(
                "CART_REQUIMENT_FAIL",
                HttpStatus.BAD_REQUEST
            );
        }

        return cartProduct;
    }

    async updateItem(
        payload: CartProductInfo,
        product_id: string
    ): Promise<CartProductEntity> {
        const cartItem = await this.getItemById(product_id);

        cartItem.quantity = payload.quantity ?? cartItem.quantity;

        try {
            await this.cartProductRepo.save(cartItem);
        } catch (error) {
            throw new HttpException(
                "ITEM_NOT_MODIFIED",
                HttpStatus.NOT_MODIFIED
            );
        }

        return cartItem;
    }

    async getCartById(cartId: string): Promise<CartEntity> {
        let cart: CartEntity;

        const filter: FindOneOptions<CartEntity> = {};
        filter.where = { id: Equal(cartId) };
        filter.select = {
            user: { username: true, id: true },
            created_at: true,
            id: true,
        };
        filter.relations = { user: true };

        try {
            cart = await this.cartRepo.findOneOrFail(filter);
        } catch (error) {
            throw new HttpException("CART_NOT_FOUND", HttpStatus.NOT_FOUND);
        }

        return cart;
    }

    async getItemById(item_id: string): Promise<CartProductEntity> {
        let product: CartProductEntity;
        const filter: FindOneOptions<CartProductEntity> = {};

        filter.where = { id: Equal(item_id) };
        filter.relations = {
            cart: { user: true },
            product: { shop: true },
            product_v: true,
        };
        filter.select = {
            id: true,
            cart: { user: { id: true } },
            created_at: true,
            product: { title: true, id: true, shop: { id: true, title: true } },
            quantity: true,
            product_v: { id: true, title: true },
        };

        try {
            product = await this.cartProductRepo.findOneOrFail(filter);
        } catch (error) {
            throw new HttpException("ITEM_NOT_FOUND", HttpStatus.NOT_FOUND);
        }
        return product;
    }

    async getFullItemById(item_id: string): Promise<CartProductEntity> {
        let product: CartProductEntity;
        const filter: FindOneOptions<CartProductEntity> = {};

        filter.where = { id: Equal(item_id) };
        filter.relations = {
            cart: { user: true },
            product: { shop: true },
            product_v: true,
            shop: true,
        };
        filter.select = {
            id: true,
            created_at: true,
            quantity: true,
        };

        try {
            product = await this.cartProductRepo.findOneOrFail(filter);
        } catch (error) {
            throw new HttpException("ITEM_NOT_FOUND", HttpStatus.NOT_FOUND);
        }
        return product;
    }

    async getUserCart(userId: string): Promise<CartEntity> {
        let cart: CartEntity;

        const filter: FindOneOptions<CartEntity> = {};
        filter.where = { user: Equal(userId) };
        filter.select = {
            user: { username: true, id: true },
            created_at: true,
            id: true,
        };
        filter.relations = { user: true };

        try {
            cart = await this.cartRepo.findOneOrFail(filter);
        } catch (error) {
            throw new HttpException("CART_NOT_FOUND", HttpStatus.NOT_FOUND);
        }

        return await this.getCartById(cart.id);
    }

    async getCartItems(cartId: string): Promise<CartProductEntity[]> {
        let items: CartProductEntity[];
        const filter: FindManyOptions<CartProductEntity> = {};
        filter.where = { cart: Equal(cartId) };
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
            await this.cartProductRepo.softRemove(item);
        } catch (error) {
            throw new HttpException(
                "ITEM_NOT_DELETED",
                HttpStatus.NOT_MODIFIED
            );
        }

        return item_id;
    }
}
