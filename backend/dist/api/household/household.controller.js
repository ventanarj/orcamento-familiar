"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.householdController = void 0;
const express_1 = require("express");
const household_service_1 = require("../../domain/household/household.service");
const householdController = (0, express_1.Router)();
exports.householdController = householdController;
householdController.get("/default", async (_req, res) => {
    const household = await household_service_1.householdService.getDefaultHousehold();
    if (!household)
        return res.status(404).json({ error: "No household available" });
    res.json(household);
});
householdController.get("/", async (_req, res) => {
    const households = await household_service_1.householdService.list();
    res.json(households);
});
