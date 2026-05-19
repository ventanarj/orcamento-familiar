"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaDatabase = void 0;
const prisma_service_1 = require("./prisma.service");
exports.prismaDatabase = {
    household: {
        findFirst: (options) => prisma_service_1.prisma.household.findFirst(options),
        findMany: (options) => prisma_service_1.prisma.household.findMany(options),
    },
    account: {
        findMany: (options) => prisma_service_1.prisma.account.findMany(options),
        create: (data) => prisma_service_1.prisma.account.create({ data }),
    },
    category: {
        findMany: (options) => prisma_service_1.prisma.category.findMany(options),
        create: (data) => prisma_service_1.prisma.category.create({ data }),
    },
    transaction: {
        findMany: (options) => prisma_service_1.prisma.transaction.findMany(options),
        create: (data) => prisma_service_1.prisma.transaction.create({ data }),
    },
    budgetCycle: {
        findFirst: (options) => prisma_service_1.prisma.budgetCycle.findFirst(options),
        findUnique: (options) => prisma_service_1.prisma.budgetCycle.findUnique(options),
    },
    budgetAllocation: {
        findMany: (options) => prisma_service_1.prisma.budgetAllocation.findMany(options),
        createMany: (options) => prisma_service_1.prisma.budgetAllocation.createMany(options),
        create: (options) => prisma_service_1.prisma.budgetAllocation.create(options),
    },
    weeklyAllocation: {
        createMany: (options) => prisma_service_1.prisma.weeklyAllocation.createMany(options),
    },
};
