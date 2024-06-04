import { Request, Response, NextFunction } from "express";
import { MikroORM, MySqlDriver, RequestContext } from "@mikro-orm/mysql";
import config from "./mikro-orm.config";
import { Product, Transaction, User } from "./entities";

class Database {
  orm = MikroORM.initSync<MySqlDriver>(config);
  em = this.orm.em;
  products = this.orm.em.getRepository(Product);
  transactions = this.orm.em.getRepository(Transaction);
  users = this.orm.em.getRepository(User);

  connect(req: Request, res: Response, next: NextFunction) {
    RequestContext.create(this.em, next);
  }
}

export default new Database();
