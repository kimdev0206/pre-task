import {
  Collection,
  Entity,
  Enum,
  ManyToOne,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { User } from "./User";
import { ProductStatus } from "../interfaces/IProduct.dto";
import { Transaction } from "./Transaction";

@Entity()
export class Product {
  @PrimaryKey()
  id: number;

  @ManyToOne(() => User)
  seller: User;

  @Property()
  name: string;

  @Property()
  price: number;

  @Property()
  amount: number;

  @Enum(() => ProductStatus)
  status!: ProductStatus;

  @OneToMany(() => Transaction, (t) => t.product)
  transactions = new Collection<Transaction>(this);

  constructor(
    id: number,
    seller: User,
    name: string,
    price: number,
    amount: number
  ) {
    this.id = id;
    this.seller = seller;
    this.name = name;
    this.price = price;
    this.amount = amount;
  }
}
