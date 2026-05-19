export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
  TRANSFER = "TRANSFER",
}

export enum TransactionStatus {
  PAST = "PAST",
  PRESENT = "PRESENT",
  FUTURE = "FUTURE",
  LATE = "LATE",
}

export interface TransactionEntity {
  id?: string;
  householdId: string;
  accountId: string;
  categoryId?: string;
  description: string;
  date: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  isPlanned?: boolean;
  isReconciled?: boolean;
  installment?: number;
  totalInstallments?: number;
  source?: string;
}
