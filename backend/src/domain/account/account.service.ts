import { database } from "../../infrastructure/database/database";
import { AccountEntity } from "./account.entity";

export class AccountService {
  async listByHousehold(householdId: string) {
    return database.account.findMany({
      where: { householdId },
      orderBy: { name: "asc" },
    });
  }

  async create(data: AccountEntity) {
    return database.account.create({
      name: data.name,
      type: data.type,
      balance: data.balance ?? 0,
      currency: data.currency ?? "BRL",
      householdId: data.householdId,
    });
  }
}

export const accountService = new AccountService();
