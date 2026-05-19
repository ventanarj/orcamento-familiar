"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.householdService = exports.HouseholdService = void 0;
const database_1 = require("../../infrastructure/database/database");
class HouseholdService {
    async getDefaultHousehold() {
        return database_1.database.household.findFirst();
    }
    async list() {
        return database_1.database.household.findMany({ orderBy: { createdAt: "asc" } });
    }
}
exports.HouseholdService = HouseholdService;
exports.householdService = new HouseholdService();
