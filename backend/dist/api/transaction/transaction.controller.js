"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionController = void 0;
const express_1 = require("express");
const transaction_service_1 = require("../../domain/transaction/transaction.service");
const household_service_1 = require("../../domain/household/household.service");
const transactionController = (0, express_1.Router)();
exports.transactionController = transactionController;
async function resolveHouseholdId(provided) {
    if (provided)
        return provided;
    const household = await household_service_1.householdService.getDefaultHousehold();
    return household?.id || "";
}
transactionController.get("/", async (req, res) => {
    const householdId = await resolveHouseholdId(String(req.query.householdId || ""));
    if (!householdId) {
        return res.status(400).json({ error: "householdId is required" });
    }
    const list = await transaction_service_1.transactionService.listByHousehold(householdId);
    res.json(list);
});
transactionController.post("/", async (req, res) => {
    try {
        const householdId = await resolveHouseholdId(String(req.body.householdId || ""));
        if (!householdId) {
            return res.status(400).json({ error: "householdId is required" });
        }
        const transaction = await transaction_service_1.transactionService.create({ ...req.body, householdId });
        res.status(201).json(transaction);
    }
    catch (error) {
        res.status(500).json({ error: "Unable to create transaction", details: String(error) });
    }
});
transactionController.get("/forecast", async (req, res) => {
    const householdId = await resolveHouseholdId(String(req.query.householdId || ""));
    if (!householdId) {
        return res.status(400).json({ error: "householdId is required" });
    }
    const startDate = new Date(String(req.query.startDate || new Date().toISOString()));
    const endDate = new Date(String(req.query.endDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()));
    const projection = await transaction_service_1.transactionService.getCashFlowProjection(householdId, startDate, endDate);
    res.json(projection);
});
