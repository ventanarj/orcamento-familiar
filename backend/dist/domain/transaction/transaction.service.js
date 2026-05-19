"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionService = exports.TransactionService = void 0;
const database_1 = require("../../infrastructure/database/database");
const transaction_entity_1 = require("./transaction.entity");
class TransactionService {
    async listByHousehold(householdId) {
        return database_1.database.transaction.findMany({
            where: { householdId },
            orderBy: { date: "desc" },
            include: { account: true, category: true },
        });
    }
    async create(data) {
        return database_1.database.transaction.create({
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
    async getCashFlowProjection(householdId, startDate, endDate) {
        const transactions = await database_1.database.transaction.findMany({
            where: {
                householdId,
                date: {
                    gte: startDate,
                    lte: endDate,
                },
            },
            include: { category: true, account: true },
        });
        const weeklyMap = new Map();
        transactions.forEach((transaction) => {
            const weekKey = new Date(transaction.date).toISOString().slice(0, 10);
            const amount = Number(transaction.amount);
            const record = weeklyMap.get(weekKey) || { reserved: 0, realized: 0, balance: 0, transactions: 0 };
            if (transaction.type === transaction_entity_1.TransactionType.EXPENSE) {
                record.realized += amount;
            }
            else {
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
exports.TransactionService = TransactionService;
exports.transactionService = new TransactionService();
