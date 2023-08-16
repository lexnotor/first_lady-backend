import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Equal, FindManyOptions, FindOneOptions, Repository } from "typeorm";
import { CartProductEntity } from "../cart/cart.entity";
import { ShopEntity } from "../shop/shop.entity";
import { UserEntity } from "../user/user.entity";
import {
    OrderEntity,
    OrderProductEntity,
    OrderState,
    OrderType,
} from "./order.entity";

@Injectable()
export class OrderService {
    constructor(
        @InjectRepository(OrderEntity)
        private readonly orderRepo: Repository<OrderEntity>,
        @InjectRepository(OrderProductEntity)
        private readonly orderProductRepo: Repository<OrderProductEntity>
    ) {}

    async addOrder(
        user: UserEntity,
        type: OrderType,
        shop: ShopEntity,
        ...items: CartProductEntity[]
    ): Promise<OrderEntity> {
        const order = new OrderEntity();
        order.shop = shop;
        order.paid = true;
        order.state = OrderState.PENDING;
        order.address = "";
        order.date = new Date();
        order.type = type ?? OrderType.DELIVERY;
        order.user = user;

        try {
            await this.orderRepo.save(order);
        } catch (error) {
            throw new HttpException(
                "ORDER_REQUIMENT_FAIL",
                HttpStatus.BAD_REQUEST
            );
        }

        const orderProducts = items.map((item) => {
            const orderProduct = new OrderProductEntity();

            orderProduct.quantity = item.quantity;
            orderProduct.product = item.product;
            orderProduct.order = order;
            orderProduct.product_v = item.product_v;

            return orderProduct;
        });

        try {
            await Promise.all(
                orderProducts.map((item) => this.orderProductRepo.save(item))
            );
        } catch (error) {
            throw new HttpException(
                "PRODUCT_ORDER_REQUIMENT_FAIL",
                HttpStatus.FAILED_DEPENDENCY
            );
        }

        return order;
    }

    async getOrderById(orderId: string): Promise<OrderEntity> {
        let order: OrderEntity;

        const filter: FindOneOptions<OrderEntity> = {};
        filter.where = { id: Equal(orderId) };
        filter.relations = { products: true, shop: true, user: true };

        try {
            order = await this.orderRepo.findOneOrFail(filter);
        } catch (error) {
            throw new HttpException("ORDER_NOT_EXIST", HttpStatus.NOT_FOUND);
        }

        return order;
    }

    async getUserOrders(userId: string): Promise<OrderEntity[]> {
        let orders: OrderEntity[];
        const filter: FindManyOptions<OrderEntity> = {};
        filter.where = { user: Equal(userId) };
        filter.relations = { products: true, shop: true, user: true };

        try {
            orders = await this.orderRepo.find(filter);
        } catch (error) {
            throw new HttpException("", HttpStatus.CONFLICT);
        }

        return orders;
    }

    async getProductOrder(orderId: string): Promise<OrderProductEntity[]> {
        let orderProduct: OrderProductEntity[];
        const filter: FindOneOptions<OrderEntity> = {};
        filter.where = { id: Equal(orderId) };
        filter.relations = { products: { product: true, product_v: true } };
        filter.withDeleted = true;

        try {
            const order = await this.orderRepo.findOne(filter);
            orderProduct = order.products;
        } catch (error) {
            throw new HttpException("ORDER_NOT_FOUND", HttpStatus.NOT_FOUND);
        }

        return orderProduct;
    }

    async getOrderAllOrders(): Promise<OrderEntity[]> {
        let orders: OrderEntity[];
        const filter: FindManyOptions<OrderEntity> = {};
        filter.relations = { shop: true, products: true, user: true };

        try {
            orders = await this.orderRepo.find(filter);
        } catch (error) {
            throw new HttpException(
                "NO_ORDER_FOUND",
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }

        return orders;
    }

    async changeOrderStatus(
        orderId: string,
        state: OrderState
    ): Promise<OrderEntity> {
        const order = await this.getOrderById(orderId);
        order.state = state;

        try {
            await this.orderRepo.save(order);
        } catch (error) {
            throw new HttpException(
                "ORDER_NOT_MODIFIED",
                HttpStatus.NOT_MODIFIED
            );
        }

        return order;
    }

    async deleteOrder(orderId: string): Promise<string> {
        const order = await this.getOrderById(orderId);

        try {
            await this.orderRepo.softRemove(order);
        } catch (error) {
            throw new HttpException(
                "ORDER_NOT_DELETED",
                HttpStatus.NOT_MODIFIED
            );
        }

        return orderId;
    }

    async loadProductStat(year?: number) {
        if (!year)
            return {
                total_order: await this.orderRepo.count(),
                order_insitu: await this.orderRepo.count({
                    where: { type: OrderType.INSITU },
                }),
                order_delivery: await this.orderRepo.count({
                    where: { type: OrderType.DELIVERY },
                }),
                order_cancel: await this.orderRepo.count({
                    where: { state: OrderState.ERROR },
                }),
                order_done: await this.orderRepo.count({
                    where: { state: OrderState.DONE },
                }),
                order_pending: await this.orderRepo.count({
                    where: { state: OrderState.PENDING },
                }),
            };
        else {
            const results: OrderStats[] = await this.orderRepo
                .createQueryBuilder("orders")
                .groupBy("month")
                .where("date BETWEEN :start AND :end", {
                    start: new Date(year, 0, 1),
                    end: new Date(year, 11, 31),
                })
                .select("date_part('month', date)", "month")
                .addSelect("count(orders.id)", "nbr")
                .getRawMany();

            const stats: OrderStats[] = [];
            for (let i = 0; i < 12; i++)
                stats.push(
                    results.find((item) => item.month == i) ?? {
                        month: i,
                        nbr: 0,
                    }
                );

            return stats;
        }
    }
}

type OrderStats = { month: number; nbr: string | number };
