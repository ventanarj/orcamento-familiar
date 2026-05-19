import { prisma } from "./prisma.service";

export const prismaDatabase = {
  household: {
    findFirst: (options?: any) => prisma.household.findFirst(options),
    findMany: (options?: any) => prisma.household.findMany(options),
  },

  account: {
    findMany: (options?: any) => prisma.account.findMany(options),
    create: (data: any) => prisma.account.create({ data }),
  },

  category: {
    findMany: (options?: any) => prisma.category.findMany(options),
    create: (data: any) => prisma.category.create({ data }),
  },

  transaction: {
    findMany: (options?: any) => prisma.transaction.findMany(options),
    create: (data: any) => prisma.transaction.create({ data }),
  },

  budgetCycle: {
    findFirst: (options?: any) => prisma.budgetCycle.findFirst(options),
    findUnique: (options?: any) => prisma.budgetCycle.findUnique(options),
  },

  budgetAllocation: {
    findMany: (options?: any) => prisma.budgetAllocation.findMany(options),
    createMany: (options?: any) => prisma.budgetAllocation.createMany(options),
    create: (options?: any) => prisma.budgetAllocation.create(options),
  },

  weeklyAllocation: {
    createMany: (options?: any) => prisma.weeklyAllocation.createMany(options),
  },
};
