import { Transaction } from "sequelize";

import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import { ORDER_NOT_FOUND } from "../../errors/error_messages";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export class OrderNotFoundError extends Error {
  constructor(id: string) {
    super(ORDER_NOT_FOUND(id));
  }
}

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          product_id: item.productId,
          quantity: item.quantity,
        })),
      },
      { include: [{ model: OrderItemModel }] }
    );
  }

  async update(entity: Order): Promise<void> {
    const sequelize = OrderModel.sequelize!;
    await sequelize.transaction(async (t: Transaction) => {
      await OrderModel.update(
        {
          customer_id: entity.customerId,
          total: entity.total(),
        },
        { where: { id: entity.id }, transaction: t }
      );
      await this.syncOrderItems(entity, t);
    });
  }

  async find(id: string): Promise<Order> {
    const orderModel = await OrderModel.findOne({
      where: { id },
      include: [{ model: OrderItemModel }],
    });
    if (!orderModel) throw new OrderNotFoundError(id);
    return this.mapToDomain(orderModel);
  }

  async findAll(): Promise<Order[]> {
    const orders = await OrderModel.findAll({
      include: [{ model: OrderItemModel }],
    });
    return orders.map(this.mapToDomain);
  }

  private async syncOrderItems(
    entity: Order,
    transaction: Transaction
  ): Promise<void> {
    const existingItems = await OrderItemModel.findAll({
      where: { order_id: entity.id },
      transaction,
    });
    const existingIds = existingItems.map((i) => i.id);
    const incomingIds = entity.items.map((i) => i.id);
    await OrderItemModel.bulkCreate(
      entity.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        product_id: item.productId,
        quantity: item.quantity,
        order_id: entity.id,
      })),
      {
        updateOnDuplicate: ["name", "price", "product_id", "quantity"],
        transaction,
      }
    );
    const toRemove = existingIds.filter((id) => !incomingIds.includes(id));
    if (toRemove.length > 0)
      await OrderItemModel.destroy({ where: { id: toRemove }, transaction });
  }

  private mapToDomain(orderModel: OrderModel): Order {
    const items = orderModel.items.map(
      (item) =>
        new OrderItem(
          item.id,
          item.name,
          item.price,
          item.product_id,
          item.quantity
        )
    );
    return new Order(orderModel.id, orderModel.customer_id, items);
  }
}
