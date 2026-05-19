export enum CategoryType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  TRANSFER = "TRANSFER",
}

export interface CategoryEntity {
  id?: string;
  householdId: string;
  name: string;
  parentId?: string;
  allocationPercent?: number;
  limitAmount?: number;
  type: CategoryType;
}
