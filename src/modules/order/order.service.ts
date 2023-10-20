import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import {
    Between,
    Equal,
    FindManyOptions,
    FindOneOptions,
    LessThanOrEqual,
    MoreThanOrEqual,
    Repository,
} from "typeorm";
import { CartProductEntity } from "../cart/cart.entity";
import { ShopEntity } from "../shop/shop.entity";
import { UserEntity } from "../user/user.entity";
import {
    OrderEntity,
    OrderProductEntity,
    OrderState,
    OrderType,
} from "./order.entity";
import { FindOrderQueryDto } from "./order.dto";

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
        address: string,
        ...items: CartProductEntity[]
    ): Promise<OrderEntity> {
        const order = new OrderEntity();
        order.shop = shop;
        order.paid = true;
        order.state = OrderState.PENDING;
        order.address = address;
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

    async getOrderById(
        orderId: string,
        withDeleted = false
    ): Promise<OrderEntity> {
        let order: OrderEntity;

        const filter: FindOneOptions<OrderEntity> = {};
        filter.where = { id: Equal(orderId) };
        filter.relations = {
            products: { product: true, product_v: { photo: { photo: true } } },
            shop: true,
            user: true,
        };
        filter.withDeleted = withDeleted;

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
        filter.relations = {
            products: { product: true, product_v: { photo: { photo: true } } },
            shop: true,
            user: true,
        };

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
        filter.relations = {
            products: { product: true, product_v: { photo: { photo: true } } },
        };
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
        filter.relations = {
            shop: true,
            products: { product: true, product_v: { photo: { photo: true } } },
            user: true,
        };

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

    async findOrders(query: FindOrderQueryDto): Promise<OrderEntity[]> {
        let orders: OrderEntity[];
        const filter: FindManyOptions<OrderEntity> = {};
        filter.relations = {
            products: { product: true, product_v: { photo: { photo: true } } },
            shop: true,
            user: true,
        };
        filter.where = {
            date:
                query.begin && query.end
                    ? Between(new Date(query.begin), new Date(query.end))
                    : query.begin
                    ? MoreThanOrEqual(new Date(query.begin))
                    : query.end
                    ? LessThanOrEqual(new Date(query.end))
                    : undefined,
            state: query.state ?? undefined,
            type: query.type ?? undefined,
        };
        try {
            orders = await this.orderRepo.find(filter);
        } catch (error) {
            throw new HttpException("NO_ORDER_FOUND", HttpStatus.CONFLICT);
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
            const select_series = this.orderRepo.manager.query<OrderStats[]>(
                `
                SELECT
                days as month,
                coalesce(nbr, 0) as nbr,
                date($1) + days-1 as date
                FROM
                generate_series(1, 366) as days
                LEFT JOIN (
                    SELECT
                    date_part('doy', created_at) as created_day,
                    count(orders.id) as nbr
                    FROM
                    orders
                    WHERE created_at BETWEEN $1 AND $2
                    GROUP BY
                    created_day
                    ORDER BY
                    created_day
                ) as ordered ON ordered.created_day = days
                ORDER BY
                days
                `,
                [new Date(year, 0, 1), new Date(year, 11, 31)]
            );

            return select_series;
        }
    }
}

type OrderStats = { days: number; nbr: string | number };
