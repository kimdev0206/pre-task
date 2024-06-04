import HttpError from "../errors/HttpError";
import IUser from "../interfaces/IUser.dto";
import database from "../database";

export default class UserService {
  async signUp(dto: IUser) {
    const row = await database.users.findOne({ name: dto.name });

    if (row) {
      const message = "동일한 name 의 회원이 존재합니다.";
      throw new HttpError(409, message);
    }

    database.users.create(dto);
    await database.em.flush();
  }

  async logIn(dto: IUser) {
    const row = await database.users.findOne({ name: dto.name });

    if (!row) {
      const message = "요청하신 name 의 회원이 존재하지 않습니다.";
      throw new HttpError(404, message);
    }

    if (row.password !== dto.password) {
      const message = "요청하신 password 가 일치하지 않습니다.";
      throw new HttpError(400, message);
    }

    return row.id;
  }
}
