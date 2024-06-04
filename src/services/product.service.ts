import HttpError from "../errors/HttpError";
import { IProductItem, IProductList } from "../interfaces/IProduct.dto";
import ProductRepository from "../repositories/product.repository";
import database from "../database";

export default class ProductService {
  repository = new ProductRepository();

  async getProducts(dto: IProductList) {
    const rows = await this.repository.selectProducts(dto);

    if (!rows.length) {
      const message = "상품이 존재하지 않습니다.";
      throw new HttpError(404, message);
    }

    return {
      meta: {
        size: rows.length,
      },
      data: rows,
    };
  }

  async getProduct(dto: IProductItem) {
    if (dto.userID) {
      var row = await database.products.findOne(
        {
          id: dto.productID,
          $or: [
            { seller: dto.userID },
            { transactions: { buyer: dto.userID } },
          ],
        },
        {
          populate: ["transactions"],
        }
      );
    } else {
      var row = await database.products.findOne(
        {
          id: dto.productID,
        },
        {
          populate: ["transactions"],
        }
      );
    }

    if (!row) {
      const message = `요청하신 상품 ID (${dto.productID}) 가 존재하지 않습니다.`;
      throw new HttpError(404, message);
    }

    return row;
  }
}
