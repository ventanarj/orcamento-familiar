import { database } from "../../infrastructure/database/database";
import { CategoryEntity, CategoryType } from "./category.entity";

export class CategoryService {
  async listByHousehold(householdId: string) {
    return database.category.findMany({
      where: { householdId },
      orderBy: [{ parent: { name: "asc" } }, { name: "asc" }],
    });
  }

  async create(data: CategoryEntity) {
    return database.category.create({
      name: data.name,
      type: data.type,
      allocation: data.allocationPercent ?? 0,
      limit: data.limitAmount ?? 0,
      householdId: data.householdId,
      parentId: data.parentId,
    });
  }
}

export const categoryService = new CategoryService();
