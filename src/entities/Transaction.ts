import { Entity, Enum, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { User } from "./User";
import { Product } from "./Product";
import { TransactionStatus } from "../interfaces/ITransaction.dto";

@Entity()
export class Transaction {
  @PrimaryKey()
  id: number;

  @ManyToOne(() => Product)
  product: Product;

  @ManyToOne(() => User)
  buyer: User;

  @Property()
  price: number;

  @Enum(() => TransactionStatus)
  status!: TransactionStatus;

  constructor(id: number, product: Product, buyer: User, price: number) {
    this.id = id;
    this.product = product;
    this.buyer = buyer;
    this.price = price;
  }
}
