"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonDatabase = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const defaultDataFile = path_1.default.resolve(process.cwd(), "backend-data.json");
const dataFilePath = process.env.DATA_JSON_FILE ? path_1.default.resolve(process.cwd(), process.env.DATA_JSON_FILE) : defaultDataFile;
async function readStorage() {
    try {
        const fileContent = await promises_1.default.readFile(dataFilePath, "utf8");
        return JSON.parse(fileContent);
    }
    catch (error) {
        const initialData = {
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
async function writeStorage(data) {
    await promises_1.default.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf8");
}
function matchesWhere(entity, where) {
    if (!where)
        return true;
    return Object.entries(where).every(([key, value]) => {
        const entityValue = entity[key];
        if (value && typeof value === "object" && !Array.isArray(value)) {
            if ("contains" in value) {
                return String(entityValue ?? "").includes(String(value.contains));
            }
            if ("gte" in value || "lte" in value || "gt" in value || "lt" in value) {
                const rawValue = entityValue;
                const compareValue = rawValue instanceof Date ? rawValue.getTime() : typeof rawValue === "string" ? new Date(rawValue).getTime() : rawValue;
                if ("gte" in value && compareValue < new Date(value.gte).getTime())
                    return false;
                if ("lte" in value && compareValue > new Date(value.lte).getTime())
                    return false;
                if ("gt" in value && compareValue <= new Date(value.gt).getTime())
                    return false;
                if ("lt" in value && compareValue >= new Date(value.lt).getTime())
                    return false;
                return true;
            }
            return matchesWhere(entityValue ?? {}, value);
        }
        return entityValue === value;
    });
}
function resolveOrderValue(obj, order) {
    if (order === undefined || order === null)
        return order;
    if (typeof order !== "object")
        return obj?.[order];
    const [key, value] = Object.entries(order)[0] ?? [null, null];
    if (key == null)
        return undefined;
    return resolveOrderValue(obj?.[key], value);
}
function applyOrderBy(items, orderBy) {
    if (!orderBy)
        return items;
    const keys = Array.isArray(orderBy) ? orderBy : [orderBy];
    return [...items].sort((a, b) => {
        for (const order of keys) {
            const [key, direction] = Object.entries(order)[0] ?? [null, null];
            const aValue = typeof direction === "object" && direction !== null ? resolveOrderValue(a, order) : key?.split(".").reduce((obj, part) => obj?.[part], a);
            const bValue = typeof direction === "object" && direction !== null ? resolveOrderValue(b, order) : key?.split(".").reduce((obj, part) => obj?.[part], b);
            const sortDirection = typeof direction === "object" && direction !== null ? Object.values(direction)[0] : direction;
            if (aValue === bValue)
                continue;
            if (sortDirection === "asc")
                return aValue > bValue ? 1 : -1;
            return aValue > bValue ? -1 : 1;
        }
        return 0;
    });
}
exports.jsonDatabase = {
    household: {
        async findFirst(options) {
            const storage = await readStorage();
            const items = storage.households.filter((item) => matchesWhere(item, options?.where));
            const ordered = applyOrderBy(items, options?.orderBy);
            return ordered[0] ?? null;
        },
        async findMany(options) {
            const storage = await readStorage();
            const items = storage.households.filter((item) => matchesWhere(item, options?.where));
            const ordered = applyOrderBy(items, options?.orderBy);
            return ordered;
        },
    },
    account: {
        async findMany(options) {
            const storage = await readStorage();
            const items = storage.accounts.filter((item) => matchesWhere(item, options?.where));
            return applyOrderBy(items, options?.orderBy);
        },
        async create({ name, type, balance, currency, householdId }) {
            const storage = await readStorage();
            const now = new Date().toISOString();
            const record = {
                id: crypto_1.default.randomUUID(),
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
        async findMany(options) {
            const storage = await readStorage();
            const items = storage.categories.filter((item) => matchesWhere(item, options?.where));
            return applyOrderBy(items, options?.orderBy);
        },
        async create({ name, type, allocation, limit, householdId, parentId }) {
            const storage = await readStorage();
            const now = new Date().toISOString();
            const record = {
                id: crypto_1.default.randomUUID(),
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
        async findMany(options) {
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
        async create({ householdId, accountId, categoryId, description, date, amount, type, status, isPlanned, isReconciled, installment, totalInstallments, source }) {
            const storage = await readStorage();
            const now = new Date().toISOString();
            const record = {
                id: crypto_1.default.randomUUID(),
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
        async findFirst(options) {
            const storage = await readStorage();
            let items = storage.budgetCycles.filter((item) => matchesWhere(item, options?.where));
            items = applyOrderBy(items, options?.orderBy);
            const cycle = items[0] ?? null;
            if (!cycle)
                return null;
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
        async findUnique(options) {
            const storage = await readStorage();
            const cycle = storage.budgetCycles.find((item) => item.id === options.where.id) ?? null;
            if (!cycle)
                return null;
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
        async findMany(options) {
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
        async createMany({ data }) {
            const storage = await readStorage();
            const now = new Date().toISOString();
            const records = data.map((item) => ({
                id: crypto_1.default.randomUUID(),
                ...item,
                createdAt: now,
                updatedAt: now,
            }));
            storage.budgetAllocations.push(...records);
            await writeStorage(storage);
            return { count: records.length };
        },
        async create({ data }) {
            const storage = await readStorage();
            const now = new Date().toISOString();
            const record = {
                id: crypto_1.default.randomUUID(),
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
        async createMany({ data }) {
            const storage = await readStorage();
            const now = new Date().toISOString();
            const records = data.map((item) => ({
                id: crypto_1.default.randomUUID(),
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
