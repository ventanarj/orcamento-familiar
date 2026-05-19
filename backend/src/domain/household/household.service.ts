import { database } from "../../infrastructure/database/database";

export class HouseholdService {
  async getDefaultHousehold() {
    return database.household.findFirst();
  }

  async list() {
    return database.household.findMany({ orderBy: { createdAt: "asc" } });
  }
}

export const householdService = new HouseholdService();
