import { prismaDatabase } from "./prisma.adapter";
import { jsonDatabase } from "./json.adapter";

const provider = (process.env.DATA_PROVIDER ?? "POSTGRES").toUpperCase();

export const database: any = provider === "JSON" ? jsonDatabase : prismaDatabase;

export const currentDataProvider = provider;
