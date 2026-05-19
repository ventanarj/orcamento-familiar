import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const defaultDataFile = path.resolve(process.cwd(), "backend-data.json");
const dataFilePath = process.env.DATA_JSON_FILE ? path.resolve(process.cwd(), process.env.DATA_JSON_FILE) : defaultDataFile;

interface StorageData {
  households: any[];
  accounts: any[];
  categories: any[];
  transactions: any[];
  budgetCycles: any[];
  budgetAllocations: any[];
  weeklyAllocations: any[];
}

async function readStorage(): Promise<StorageData> {
  try {
    const fileContent = await fs.readFile(dataFilePath, "utf8");
    return JSON.parse(fileContent) as StorageData;
  } catch (error) {
    const initialData: StorageData = {
      households: [],
      accounts: [],
      categories: [],
      transactions: [],
      budgetCycles: [],
      budgetAllocations: [],
      weeklyAllocations: [],
    };
    await writeStorage(initialData);
    return initialData;
  }
}

async function writeStorage(data: StorageData) {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}

function matchesWhere(entity: any, where: any): boolean {
  if (!where) return true;

  return Object.entries(where).every(([key, value]) => {
    const entityValue = entity[key];

    if (value && typeof value === "object" && !Array.isArray(value)) {
      if ("contains" in value) {
        return String(entityValue ?? "").includes(String((value as any).contains));
      }
      if ("gte" in value || "lte" in value || "gt" in value || "lt" in value) {
        const rawValue = entityValue;
        const compareValue = rawValue instanceof Date ? rawValue.getTime() : typeof rawValue === "string" ? new Date(rawValue).getTime() : rawValue;
        if ("gte" in value && compareValue < new Date((value as any).gte).getTime()) return false;
        if ("lte" in value && compareValue > new Date((value as any).lte).getTime()) return false;
        if ("gt" in value && compareValue <= new Date((value as any).gt).getTime()) return false;
        if ("lt" in value && compareValue >= new Date((value as any).lt).getTime()) return false;
        return true;
      }
      return matchesWhere(entityValue ?? {}, value);
    }

    return entityValue === value;
  });
}

function resolveOrderValue(obj: any, order: any): any {
  if (typeof order !== "object" || order === null) {
    return obj;
  }
  const [key, value] = Object.entries(order)[0] ?? [null, null];
  if (key == null) return undefined;
  return resolveOrderValue(obj?.[key], value);
}

function applyOrderBy(items: any[], orderBy: any) {
  if (!orderBy) return items;
  const keys = Array.isArray(orderBy) ? orderBy : [orderBy];
  return [...items].sort((a, b) => {
    for (const order of keys) {
      const [key, direction] = Object.entries(order)[0] ?? [null, null];
      const aValue = typeof direction === "object" && direction !== null ? resolveOrderValue(a, order) : key?.split(".").reduce((obj, part) => obj?.[part], a);
      const bValue = typeof direction === "object" && direction !== null ? resolveOrderValue(b, order) : key?.split(".").reduce((obj, part) => obj?.[part], b);
      const sortDirection = typeof direction === "object" && direction !== null ? (Object.values(direction)[0] as any) : direction;
      if (aValue === bValue) continue;
      if (sortDirection === "asc") return aValue > bValue ? 1 : -1;
      return aValue > bValue ? -1 : 1;
    }
    return 0;
  });
}

export const jsonDatabase = {
  household: {
    async findFirst(options: any) {
      const storage = await readStorage();
      const items = storage.households.filter((item) => matchesWhere(item, options?.where));
      const ordered = applyOrderBy(items, options?.orderBy);
      return ordered[0] ?? null;
    },
    async findMany(options: any) {
      const storage = await readStorage();
      const items = storage.households.filter((item) => matchesWhere(item, options?.where));
      const ordered = applyOrderBy(items, options?.orderBy);
      return ordered;
    },
  },

  account: {
    async findMany(options: any) {
      const storage = await readStorage();
      const items = storage.accounts.filter((item) => matchesWhere(item, options?.where));
      return applyOrderBy(items, options?.orderBy);
    },
    async create({ name, type, balance, currency, householdId }: any) {
      const storage = await readStorage();
      const now = new Date().toISOString();
      const record = {
        id: crypto.randomUUID(),
        name,
        type,
        balance: balance ?? 0,
        currency: currency ?? "BRL",
        householdId,
        createdAt: now,
        updatedAt: now,
      };
      storage.accounts.push(record);
      await writeStorage(storage);
      return record;
    },
  },

  category: {
    async findMany(options: any) {
      const storage = await readStorage();
      const items = storage.categories.filter((item) => matchesWhere(item, options?.where));
      return applyOrderBy(items, options?.orderBy);
    },
    async create({ name, type, allocation, limit, householdId, parentId }: any) {
      const storage = await readStorage();
      const now = new Date().toISOString();
      const record = {
        id: crypto.randomUUID(),
        name,
        type,
        allocation: allocation ?? 0,
        limit: limit ?? 0,
        householdId,
        parentId: parentId ?? null,
        createdAt: now,
        updatedAt: now,
      };
      storage.categories.push(record);
      await writeStorage(storage);
      return record;
    },
  },

  transaction: {
    async findMany(options: any) {
      const storage = await readStorage();
      let items = storage.transactions.filter((item) => matchesWhere(item, options?.where));
      items = applyOrderBy(items, options?.orderBy);
      if (options?.include?.account) {
        items = items.map((item) => ({
          ...item,
          account: storage.accounts.find((account) => account.id === item.accountId) ?? null,
        }));
      }
      if (options?.include?.category) {
        items = items.map((item) => ({
          ...item,
          category: storage.categories.find((category) => category.id === item.categoryId) ?? null,
        }));
      }
      return items;
    },
    async create({ householdId, accountId, categoryId, description, date, amount, type, status, isPlanned, isReconciled, installment, totalInstallments, source }: any) {
      const storage = await readStorage();
      const now = new Date().toISOString();
      const record = {
        id: crypto.randomUUID(),
        householdId,
        accountId,
        categoryId: categoryId ?? null,
        description,
        date: new Date(date).toISOString(),
        amount,
        type,
        status,
        isPlanned: isPlanned ?? false,
        isReconciled: isReconciled ?? false,
        installment: installment ?? null,
        totalInstallments: totalInstallments ?? null,
        source: source ?? null,
        createdAt: now,
        updatedAt: now,
      };
      storage.transactions.push(record);
      await writeStorage(storage);
      return record;
    },
  },

  budgetCycle: {
    async findFirst(options: any) {
      const storage = await readStorage();
      let items = storage.budgetCycles.filter((item) => matchesWhere(item, options?.where));
      items = applyOrderBy(items, options?.orderBy);
      const cycle = items[0] ?? null;
      if (!cycle) return null;
      if (options?.include?.allocations) {
        const allocations = storage.budgetAllocations.filter((allocation) => allocation.budgetCycleId === cycle.id);
        cycle.allocations = allocations.map((allocation) => {
          const entity = { ...allocation };
          if (options.include.allocations.include?.category) {
            entity.category = storage.categories.find((category) => category.id === allocation.categoryId) ?? null;
          }
          if (options.include.allocations.include?.weeklyAllocations) {
            entity.weeklyAllocations = storage.weeklyAllocations.filter((week) => week.budgetAllocationId === allocation.id);
          }
          return entity;
        });
      }
      return cycle;
    },
    async findUnique(options: any) {
      const storage = await readStorage();
      const cycle = storage.budgetCycles.find((item) => item.id === options.where.id) ?? null;
      if (!cycle) return null;
      if (options?.include?.allocations) {
        const allocations = storage.budgetAllocations.filter((allocation) => allocation.budgetCycleId === cycle.id);
        cycle.allocations = allocations.map((allocation) => {
          const entity = { ...allocation };
          if (options.include.allocations.include?.category) {
            entity.category = storage.categories.find((category) => category.id === allocation.categoryId) ?? null;
          }
          if (options.include.allocations.include?.weeklyAllocations) {
            entity.weeklyAllocations = storage.weeklyAllocations.filter((week) => week.budgetAllocationId === allocation.id);
          }
          return entity;
        });
      }
      return cycle;
    },
  },

  budgetAllocation: {
    async findMany(options: any) {
      const storage = await readStorage();
      let items = storage.budgetAllocations.filter((item) => matchesWhere(item, options?.where));
      if (options?.include?.weeklyAllocations) {
        items = items.map((allocation) => ({
          ...allocation,
          weeklyAllocations: storage.weeklyAllocations.filter((week) => week.budgetAllocationId === allocation.id),
        }));
      }
      return items;
    },
    async createMany({ data }: any) {
      const storage = await readStorage();
      const now = new Date().toISOString();
      const records = data.map((item: any) => ({
        id: crypto.randomUUID(),
        ...item,
        createdAt: now,
        updatedAt: now,
      }));
      storage.budgetAllocations.push(...records);
      await writeStorage(storage);
      return { count: records.length };
    },
    async create({ data }: any) {
      const storage = await readStorage();
      const now = new Date().toISOString();
      const record = {
        id: crypto.randomUUID(),
        ...data,
        createdAt: now,
        updatedAt: now,
      };
      storage.budgetAllocations.push(record);
      await writeStorage(storage);
      return record;
    },
  },

  weeklyAllocation: {
    async createMany({ data }: any) {
      const storage = await readStorage();
      const now = new Date().toISOString();
      const records = data.map((item: any) => ({
        id: crypto.randomUUID(),
        ...item,
        createdAt: now,
        updatedAt: now,
      }));
      storage.weeklyAllocations.push(...records);
      await writeStorage(storage);
      return { count: records.length };
    },
  },
};
