import { SqlEntityManager } from "@mikro-orm/mysql";
import HttpError from "../errors/HttpError";
import { ProductStatus } from "../interfaces/IProduct.dto";
import ITransaction, {
  TransactionStatus,
} from "../interfaces/ITransaction.dto";
import TransactionRepository from "../repositories/transaction.repository";
import database from "../database";
import TaskQueue from "../task-queue";

export default class TransactionService {
  repository = new TransactionRepository();
  taskQueue = new TaskQueue(1);

  private async updateProductStatus(em: SqlEntityManager, dto: ITransaction) {
    const [transactionCount, product] = await Promise.all([
      database.transactions.count({
        product: dto.productID,
        status: dto.status,
      }),
      database.products.findOne({ id: dto.productID }),
    ]);

    if (!product) {
      const message = "상품이 존재하지 않습니다.";
      throw new HttpError(404, message);
    }

    if (!product.amount) {
      const message = "상품 수량이 없습니다.";
      throw new HttpError(500, message);
    }

    let status = product.status;

    if (dto.status === TransactionStatus.구매요청) {
      if (transactionCount < product.amount) {
        status = ProductStatus.판매중;
      }

      if (transactionCount >= product.amount) {
        status = ProductStatus.예약중;
      }
    }

    if (
      dto.status === TransactionStatus.구매확정 &&
      transactionCount === product.amount
    ) {
      status = ProductStatus.완료;
    }

    product.status = status;
    await em.persistAndFlush(product);
  }

  async requestTransaction(dto: ITransaction & { price: number }) {
    const transaction = await this.repository.selectTransactionStatus(dto);

    if (transaction) {
      const message = `이미 ${TransactionStatus.구매요청} 처리되었습니다.`;
      throw new HttpError(409, message);
    }

    await this.taskQueue.runTask(async () => {
      const em = database.em.fork();

      try {
        await em.begin();

        database.transactions.create({
          product: dto.productID,
          buyer: dto.buyerID,
          price: dto.price,
          status: dto.status,
        });
        await this.updateProductStatus(em, dto);

        await em.commit();
      } catch (error) {
        await em.rollback();

        throw error;
      }
    });
  }

  async approveTransaction(dto: ITransaction) {
    const transaction = await this.repository.selectTransactionStatus(dto);

    if (!transaction) {
      const message = `요청하신 상품 ID (${dto.productID}) 의 판매자가 아닙니다.`;
      throw new HttpError(403, message);
    }

    if (transaction.status === dto.status) {
      const message = `이미 ${TransactionStatus.판매승인} 처리되었습니다.`;
      throw new HttpError(409, message);
    }

    const em = database.em.fork();

    try {
      await em.begin();

      const transaction = await database.transactions.findOne({
        product: dto.productID,
        buyer: dto.buyerID,
      });

      if (!transaction) {
        const message = "거래가 존재하지 않습니다.";
        throw new HttpError(404, message);
      }

      transaction.status = dto.status;
      await database.em.persistAndFlush(transaction);

      await em.commit();
    } catch (error) {
      await em.rollback();

      throw error;
    }
  }

  async confirmTransaction(dto: ITransaction) {
    const transaction = await this.repository.selectTransactionStatus(dto);

    if (transaction.status === TransactionStatus.구매요청) {
      const message = `아직 ${TransactionStatus.판매승인} 처리되지 않았습니다.`;
      throw new HttpError(403, message);
    }

    if (transaction.status === dto.status) {
      const message = `이미 ${TransactionStatus.구매확정} 처리되었습니다.`;
      throw new HttpError(409, message);
    }

    const em = database.em.fork();

    try {
      await em.begin();

      const transaction = await database.transactions.findOne({
        product: dto.productID,
        buyer: dto.buyerID,
      });

      if (!transaction) {
        const message = "거래가 존재하지 않습니다.";
        throw new HttpError(404, message);
      }

      transaction.status = dto.status;
      await em.persistAndFlush(transaction);

      await this.updateProductStatus(em, dto);

      await em.commit();
    } catch (error) {
      await em.rollback();

      throw error;
    }
  }
}
