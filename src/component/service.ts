import UserR from "./models";
import { UserRSignupAttributes } from "./types";

export class UserRService {
  static async register(user: UserRSignupAttributes) {
    return await UserR.create(user);
  }

  static async updateUserR(user: UserR) {
    return await user.save();
  }

  static async getUserRByEmail(email: string) {
    return await UserR.findOne({
      where: { email: email },
    });
  }

  static async getUserRByid(id: string) {
    return await UserR.findOne({ where: { id: id } });
  }
  static async getAllUserRs() {
    return await UserR.findAll();
  }
 
}