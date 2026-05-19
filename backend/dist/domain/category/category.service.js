"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryService = exports.CategoryService = void 0;
const database_1 = require("../../infrastructure/database/database");
class CategoryService {
    async listByHousehold(householdId) {
        return database_1.database.category.findMany({
            where: { householdId },
            orderBy: [{ parent: { name: "asc" } }, { name: "asc" }],
        });
    }
    async create(data) {
        return database_1.database.category.create({
            name: data.name,
            type: data.type,
            allocation: data.allocationPercent ?? 0,
            limit: data.limitAmount ?? 0,
            householdId: data.householdId,
            parentId: data.parentId,
        });
    }
}
exports.CategoryService = CategoryService;
exports.categoryService = new CategoryService();
