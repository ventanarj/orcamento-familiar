import { database } from "../../infrastructure/database/database";

interface BudgetForecastAllocation {
  categoryId: string;
  categoryName: string;
  allocationPercent: number;
  plannedAmount: number;
  actualSpent: number;
  remaining: number;
  limit: number;
  remainingLimit: number;
  percentUsed: number;
  performance: "onTrack" | "warning" | "over";
}

interface RedistributionEntry {
  fromCategoryId: string;
  fromCategoryName: string;
  toCategoryId: string;
  toCategoryName: string;
  amount: number;
}

export class BudgetService {
  async getBudgetCycle(householdId: string) {
    return database.budgetCycle.findFirst({
      where: { householdId },
      include: {
        allocations: {
          include: { weeklyAllocations: true, category: true },
        },
      },
      orderBy: { startDate: "desc" },
    });
  }

  async getBudgetForecast(householdId: string) {
    const cycle = await database.budgetCycle.findFirst({
      where: { householdId },
      include: {
        allocations: {
          include: { weeklyAllocations: true, category: true },
        },
      },
      orderBy: { startDate: "desc" },
    });

    if (!cycle) return null;

    const transactions = await database.transaction.findMany({
      where: {
        householdId,
        date: {
          gte: cycle.startDate,
          lte: cycle.endDate,
        },
      },
      include: { category: true },
    });

    const expenseByCategory = new Map<string, number>();
    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((transaction: any) => {
      const amount = Number(transaction.amount);
      if (transaction.type === "INCOME") {
        totalIncome += amount;
      }

      if (transaction.type === "EXPENSE") {
        totalExpense += Math.abs(amount);
        if (transaction.categoryId) {
          const previous = expenseByCategory.get(transaction.categoryId) || 0;
          expenseByCategory.set(transaction.categoryId, previous + Math.abs(amount));
        }
      }
    });

    const allocations: BudgetForecastAllocation[] = cycle.allocations.map((allocation: any) => {
      const plannedAmount = Number(allocation.plannedAmount);
      const actualSpent = expenseByCategory.get(allocation.categoryId) || 0;
      const limit = Number(allocation.limit);
      const remaining = plannedAmount - actualSpent;
      const remainingLimit = limit - actualSpent;
      const percentUsed = plannedAmount > 0 ? Math.min(100, (actualSpent / plannedAmount) * 100) : 0;
      const performance = actualSpent > plannedAmount ? "over" : actualSpent > plannedAmount * 0.9 ? "warning" : "onTrack";

      return {
        categoryId: allocation.categoryId,
        categoryName: allocation.category?.name ?? "Sem categoria",
        allocationPercent: Number(allocation.percent),
        plannedAmount,
        actualSpent,
        remaining,
        limit,
        remainingLimit,
        percentUsed,
        performance,
      };
    });

    const totalPlanned = allocations.reduce((sum, item) => sum + item.plannedAmount, 0);
    const totalLimit = allocations.reduce((sum, item) => sum + item.limit, 0);
    const totalActualSpent = allocations.reduce((sum, item) => sum + item.actualSpent, 0);
    const totalRemaining = totalPlanned - totalActualSpent;
    const projectedBalance = Number(cycle.baseAmount) + totalIncome - totalActualSpent;

    const surplusAllocations = allocations
      .filter((item) => item.remaining > 0)
      .map((item) => ({ categoryId: item.categoryId, categoryName: item.categoryName, available: item.remaining }));

    const deficitAllocations = allocations
      .filter((item) => item.actualSpent > item.plannedAmount)
      .map((item) => ({ categoryId: item.categoryId, categoryName: item.categoryName, deficit: item.actualSpent - item.plannedAmount }));

    const redistribution = this.buildRedistribution(surplusAllocations, deficitAllocations);

    const weeklyDistribution = await this.calculateWeeklyDistribution(cycle.id);

    return {
      budgetCycle: {
        id: cycle.id,
        name: cycle.name,
        startDate: cycle.startDate,
        endDate: cycle.endDate,
        baseAmount: Number(cycle.baseAmount),
      },
      totals: {
        totalPlanned,
        totalLimit,
        totalActualSpent,
        totalIncome,
        totalRemaining,
        projectedBalance,
      },
      allocations,
      redistribution,
      weeklyDistribution,
      transactions,
    };
  }

  private buildRedistribution(
    sources: Array<{ categoryId: string; categoryName: string; available: number }>,
    sinks: Array<{ categoryId: string; categoryName: string; deficit: number }>,
  ) {
    const recommendations: RedistributionEntry[] = [];
    let sourceIndex = 0;
    let sinkIndex = 0;

    while (sourceIndex < sources.length && sinkIndex < sinks.length) {
      const source = sources[sourceIndex];
      const sink = sinks[sinkIndex];
      const amount = Math.min(source.available, sink.deficit);

      if (amount <= 0) break;

      recommendations.push({
        fromCategoryId: source.categoryId,
        fromCategoryName: source.categoryName,
        toCategoryId: sink.categoryId,
        toCategoryName: sink.categoryName,
        amount,
      });

      source.available -= amount;
      sink.deficit -= amount;

      if (source.available <= 0) sourceIndex += 1;
      if (sink.deficit <= 0) sinkIndex += 1;
    }

    return recommendations;
  }

  async calculateWeeklyDistribution(budgetCycleId: string) {
    const cycle = await database.budgetCycle.findUnique({
      where: { id: budgetCycleId },
      include: {
        allocations: { include: { weeklyAllocations: true, category: true } },
      },
    });

    if (!cycle) return null;

    const msPerDay = 24 * 60 * 60 * 1000;
    const totalDays = Math.ceil((cycle.endDate.getTime() - cycle.startDate.getTime() + 1) / msPerDay);
    const weekCount = Math.max(1, Math.ceil(totalDays / 7));

    return cycle.allocations.map((allocation: any) => {
      const planned = Number(allocation.plannedAmount);
      const weeks = allocation.weeklyAllocations.length > 0 ? allocation.weeklyAllocations :
        Array.from({ length: weekCount }, (_, index) => ({
          weekIndex: index + 1,
          percent: 100 / weekCount,
          reserved: 0,
          realized: 0,
        }));

      return {
        categoryId: allocation.categoryId,
        categoryName: allocation.category?.name ?? "Sem categoria",
        plannedAmount: planned,
        weeks: weeks.map((week: any) => ({
          weekIndex: week.weekIndex,
          percent: Number(week.percent),
          reserved: Number(week.reserved || 0),
          realized: Number(week.realized || 0),
          expected: (planned * (Number(week.percent) || 0)) / 100,
        })),
      };
    });
  }
}

export const budgetService = new BudgetService();
