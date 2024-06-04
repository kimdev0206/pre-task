import { MySqlOptions } from "@mikro-orm/mysql/MySqlMikroORM";
import { SqlHighlighter } from "@mikro-orm/sql-highlighter";
import { Product, Transaction, User } from "./entities";

const config: MySqlOptions = {
  entities: [Product, Transaction, User],
  dbName: "pre-task-orm",
  password: "root",
  highlighter: new SqlHighlighter(),
  debug: true,
};

export default config;
