"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountService = exports.AccountService = void 0;
const database_1 = require("../../infrastructure/database/database");
class AccountService {
    async listByHousehold(householdId) {
        return database_1.database.account.findMany({
            where: { householdId },
            orderBy: { name: "asc" },
        });
    }
    async create(data) {
        return database_1.database.account.create({
            name: data.name,
            type: data.type,
            balance: data.balance ?? 0,
            currency: data.currency ?? "BRL",
            householdId: data.householdId,
        });
    }
}
exports.AccountService = AccountService;
exports.accountService = new AccountService();
