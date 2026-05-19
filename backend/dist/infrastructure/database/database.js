"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currentDataProvider = exports.database = void 0;
const prisma_adapter_1 = require("./prisma.adapter");
const json_adapter_1 = require("./json.adapter");
const provider = (process.env.DATA_PROVIDER ?? "POSTGRES").toUpperCase();
exports.database = provider === "JSON" ? json_adapter_1.jsonDatabase : prisma_adapter_1.prismaDatabase;
exports.currentDataProvider = provider;
