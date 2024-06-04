import { IProductItem, IProductList } from "../interfaces/IProduct.dto";
import database from "../database";

export default class ProductRepository {
  async selectProducts(dao: IProductList) {
    const qb = database.products.createQueryBuilder("p");

    qb.select([
      "p.id AS productID",
      "p.seller_id AS sellerID",
      "p.name",
      "p.price",
      "p.amount",
      "p.status AS productStatus",
    ]);

    if (dao.userID) {
      qb.leftJoinAndSelect("t", "p.id = t.product_id");
      qb.andWhere("t.status = ?", ["완료"]);

      if (dao.isBought) {
        qb.andWhere("t.buyer_id = ?", [dao.userID]);
        qb.andWhere("p.status = ?", ["완료"]);
      }

      if (dao.isReserved) {
        qb.andWhere("p.status = ?", ["예약중"]);
        qb.andWhere("(p.seller_id = ? OR t.buyer_id = ?)", [
          dao.userID,
          dao.userID,
        ]);
      }
    }

    qb.orderBy({ "p.id": "asc" });

    return await qb.execute("all");
  }
}
