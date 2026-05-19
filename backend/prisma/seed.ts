import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.budgetAllocation.deleteMany();
  await prisma.weeklyAllocation.deleteMany();
  await prisma.budgetCycle.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();
  await prisma.household.deleteMany();

  const household = await prisma.household.create({
    data: {
      name: "Família Silva",
      users: {
        create: [{ email: "admin@orcamento.com", passwordHash: "changeme", name: "Administrador" }],
      },
    },
  });

  const accounts = await prisma.account.createMany({
    data: [
      { householdId: household.id, name: "Conta Corrente", type: "CHECKING", balance: 8320, currency: "BRL" },
      { householdId: household.id, name: "Cartão de Crédito", type: "CREDIT_CARD", balance: -2800, currency: "BRL" },
    ],
  });

  const categories = await prisma.category.createMany({
    data: [
      { householdId: household.id, name: "Receitas", allocation: 0, limit: 0, type: "INCOME" },
      { householdId: household.id, name: "Necessidades fixas", allocation: 0.75, limit: 12000, type: "EXPENSE" },
      { householdId: household.id, name: "Lazer", allocation: 0.1, limit: 1800, type: "EXPENSE" },
      { householdId: household.id, name: "Investimentos", allocation: 0.05, limit: 1500, type: "EXPENSE" },
      { householdId: household.id, name: "Necessidades ocasionais", allocation: 0.1, limit: 2500, type: "EXPENSE" },
    ],
  });

  const categoryList = await prisma.category.findMany({ where: { householdId: household.id } });
  const accountsList = await prisma.account.findMany({ where: { householdId: household.id } });

  const budgetCycle = await prisma.budgetCycle.create({
    data: {
      householdId: household.id,
      name: "Ciclo de Maio 2026",
      startDate: new Date("2026-05-01T00:00:00.000Z"),
      endDate: new Date("2026-05-31T23:59:59.999Z"),
      baseAmount: 18600,
    },
  });

  const fixedCategory = categoryList.find((cat) => cat.name === "Necessidades fixas");
  const leisureCategory = categoryList.find((cat) => cat.name === "Lazer");
  const investCategory = categoryList.find((cat) => cat.name === "Investimentos");

  if (fixedCategory && leisureCategory && investCategory) {
    await prisma.budgetAllocation.createMany({
      data: [
        { budgetCycleId: budgetCycle.id, categoryId: fixedCategory.id, percent: 75, limit: 12000, plannedAmount: 13950 },
        { budgetCycleId: budgetCycle.id, categoryId: leisureCategory.id, percent: 10, limit: 1800, plannedAmount: 1860 },
        { budgetCycleId: budgetCycle.id, categoryId: investCategory.id, percent: 5, limit: 1500, plannedAmount: 930 },
      ],
    });
  }

  const requiredCategory = categoryList.find((cat) => cat.name === "Necessidades ocasionais");
  if (requiredCategory) {
    await prisma.budgetAllocation.create({
      data: {
        budgetCycleId: budgetCycle.id,
        categoryId: requiredCategory.id,
        percent: 10,
        limit: 2500,
        plannedAmount: 1860,
      },
    });
  }

  const allocations = await prisma.budgetAllocation.findMany({ where: { budgetCycleId: budgetCycle.id } });
  for (const allocation of allocations) {
    await prisma.weeklyAllocation.createMany({
      data: [
        {
          budgetAllocationId: allocation.id,
          weekIndex: 1,
          percent: 25,
          reserved: 0,
          realized: 0,
          balance: 0,
        },
        {
          budgetAllocationId: allocation.id,
          weekIndex: 2,
          percent: 25,
          reserved: 0,
          realized: 0,
          balance: 0,
        },
        {
          budgetAllocationId: allocation.id,
          weekIndex: 3,
          percent: 25,
          reserved: 0,
          realized: 0,
          balance: 0,
        },
        {
          budgetAllocationId: allocation.id,
          weekIndex: 4,
          percent: 25,
          reserved: 0,
          realized: 0,
          balance: 0,
        },
      ],
    });
  }

  const now = new Date("2026-05-18T12:00:00.000Z");
  await prisma.transaction.createMany({
    data: [
      {
        householdId: household.id,
        accountId: accountsList[0].id,
        description: "Salário Rafael",
        date: new Date("2026-05-05T10:00:00.000Z"),
        amount: 6000,
        type: "INCOME",
        status: "PAST",
        isPlanned: false,
      },
      {
        householdId: household.id,
        accountId: accountsList[1].id,
        description: "Mercado semanal",
        date: new Date("2026-05-11T14:30:00.000Z"),
        amount: -1020.45,
        type: "EXPENSE",
        status: "PAST",
        isPlanned: false,
      },
      {
        householdId: household.id,
        accountId: accountsList[0].id,
        description: "Investimento mensal",
        date: new Date("2026-05-20T09:00:00.000Z"),
        amount: -930.0,
        type: "EXPENSE",
        status: "FUTURE",
        isPlanned: true,
      },
      {
        householdId: household.id,
        accountId: accountsList[0].id,
        description: "Lazer cinema",
        date: new Date("2026-05-24T19:00:00.000Z"),
        amount: -180.0,
        type: "EXPENSE",
        status: "FUTURE",
        isPlanned: true,
      },
    ],
  });

  console.log("Seed data inserted successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
