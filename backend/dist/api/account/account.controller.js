"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountController = void 0;
const express_1 = require("express");
const account_service_1 = require("../../domain/account/account.service");
const household_service_1 = require("../../domain/household/household.service");
const accountController = (0, express_1.Router)();
exports.accountController = accountController;
async function resolveHouseholdId(provided) {
    if (provided)
        return provided;
    const household = await household_service_1.householdService.getDefaultHousehold();
    return household?.id || "";
}
accountController.get("/", async (req, res) => {
    const householdId = await resolveHouseholdId(String(req.query.householdId || ""));
    if (!householdId)
        return res.status(400).json({ error: "householdId is required" });
    const accounts = await account_service_1.accountService.listByHousehold(householdId);
    res.json(accounts);
});
accountController.post("/", async (req, res) => {
    try {
        const householdId = await resolveHouseholdId(String(req.body.householdId || ""));
        if (!householdId)
            return res.status(400).json({ error: "householdId is required" });
        const account = await account_service_1.accountService.create({ ...req.body, householdId });
        res.status(201).json(account);
    }
    catch (error) {
        res.status(500).json({ error: "Unable to create account", details: String(error) });
    }
});
