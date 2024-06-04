import ITransaction from "../interfaces/ITransaction.dto";
import database from "../database";

export default class TransactionRepository {
  async selectTransactionStatus(dao: ITransaction) {
    const qb = database.transactions.createQueryBuilder("t");

    qb.select(["t.status"]);

    if (dao.sellerID) {
      qb.innerJoinAndSelect("p", "t.product_id = p.id");
      qb.andWhere("t.product_id = ?", [dao.productID]);
      qb.andWhere("seller_id = ?", [dao.sellerID]);
    } else {
      qb.andWhere("t.product_id = ?", [dao.productID]);
      qb.andWhere("t.buyer_id = ?", [dao.buyerID]);
    }

    return await qb.execute("get");
  }
}
