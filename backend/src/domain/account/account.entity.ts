export enum AccountType {
  CHECKING = "CHECKING",
  SAVINGS = "SAVINGS",
  CREDIT_CARD = "CREDIT_CARD",
  INVESTMENT = "INVESTMENT",
}

export interface AccountEntity {
  id?: string;
  householdId: string;
  name: string;
  type: AccountType;
  balance?: number;
  currency?: string;
}
