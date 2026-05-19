import { database } from "../../infrastructure/database/database";
import { TransactionEntity, TransactionStatus, TransactionType } from "./transaction.entity";

export class TransactionService {
  async listByHousehold(householdId: string) {
    return database.transaction.findMany({
      where: { householdId },
      orderBy: { date: "desc" },
      include: { account: true, category: true },
    });
  }

  async create(data: TransactionEntity) {
    return database.transaction.create({
      householdId: data.householdId,
      accountId: data.accountId,
      categoryId: data.categoryId,
      description: data.description,
      date: new Date(data.date),
      amount: data.amount,
      type: data.type,
      status: data.status,
      isPlanned: data.isPlanned ?? false,
      isReconciled: data.isReconciled ?? false,
      installment: data.installment,
      totalInstallments: data.totalInstallments,
      source: data.source,
    });
  }

  async getCashFlowProjection(householdId: string, startDate: Date, endDate: Date) {
    const transactions = await database.transaction.findMany({
      where: {
        householdId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { category: true, account: true },
    });

    const weeklyMap = new Map<string, { reserved: number; realized: number; balance: number; transactions: number }>();

    transactions.forEach((transaction: any) => {
      const weekKey = new Date(transaction.date).toISOString().slice(0, 10);
      const amount = Number(transaction.amount);
      const record = weeklyMap.get(weekKey) || { reserved: 0, realized: 0, balance: 0, transactions: 0 };
      if (transaction.type === TransactionType.EXPENSE) {
        record.realized += amount;
      } else {
        record.reserved += amount;
      }
      record.balance = record.reserved + record.realized;
      record.transactions += 1;
      weeklyMap.set(weekKey, record);
    });

    return Array.from(weeklyMap.entries()).map(([week, values]) => ({
      week,
      ...values,
    }));
  }
}

export const transactionService = new TransactionService();
