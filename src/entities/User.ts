import {
  Collection,
  Entity,
  OneToMany,
  PrimaryKey,
  Property,
} from "@mikro-orm/core";
import { Product } from "./Product";
import { Transaction } from "./Transaction";

@Entity()
export class User {
  @PrimaryKey()
  id: number;

  @Property()
  name: string;

  @Property()
  password: string;

  @OneToMany(() => Product, (p) => p.seller)
  products = new Collection<Product>(this);

  @OneToMany(() => Transaction, (t) => t.buyer)
  transactions = new Collection<Transaction>(this);

  constructor(id: number, name: string, password: string) {
    this.id = id;
    this.name = name;
    this.password = password;
  }
}
