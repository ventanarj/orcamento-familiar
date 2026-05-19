"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.budgetController = void 0;
const express_1 = require("express");
const budget_service_1 = require("../../domain/budget/budget.service");
const household_service_1 = require("../../domain/household/household.service");
const budgetController = (0, express_1.Router)();
exports.budgetController = budgetController;
async function resolveHouseholdId(provided) {
    if (provided)
        return provided;
    const household = await household_service_1.householdService.getDefaultHousehold();
    return household?.id || "";
}
budgetController.get("/cycle", async (req, res) => {
    const householdId = await resolveHouseholdId(String(req.query.householdId || ""));
    if (!householdId) {
        return res.status(400).json({ error: "householdId is required" });
    }
    const cycle = await budget_service_1.budgetService.getBudgetCycle(householdId);
    if (!cycle) {
        return res.status(404).json({ error: "No budget cycle found" });
    }
    res.json(cycle);
});
budgetController.get("/forecast", async (req, res) => {
    const householdId = await resolveHouseholdId(String(req.query.householdId || ""));
    if (!householdId) {
        return res.status(400).json({ error: "householdId is required" });
    }
    const forecast = await budget_service_1.budgetService.getBudgetForecast(householdId);
    if (!forecast) {
        return res.status(404).json({ error: "No budget cycle found" });
    }
    res.json(forecast);
});
budgetController.get("/distribution", async (req, res) => {
    const budgetCycleId = String(req.query.budgetCycleId || "");
    if (!budgetCycleId) {
        return res.status(400).json({ error: "budgetCycleId is required" });
    }
    const distribution = await budget_service_1.budgetService.calculateWeeklyDistribution(budgetCycleId);
    res.json(distribution);
});
