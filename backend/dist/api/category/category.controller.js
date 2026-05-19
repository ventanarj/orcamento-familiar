"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryController = void 0;
const express_1 = require("express");
const category_service_1 = require("../../domain/category/category.service");
const household_service_1 = require("../../domain/household/household.service");
const categoryController = (0, express_1.Router)();
exports.categoryController = categoryController;
async function resolveHouseholdId(provided) {
    if (provided)
        return provided;
    const household = await household_service_1.householdService.getDefaultHousehold();
    return household?.id || "";
}
categoryController.get("/", async (req, res) => {
    const householdId = await resolveHouseholdId(String(req.query.householdId || ""));
    if (!householdId)
        return res.status(400).json({ error: "householdId is required" });
    const categories = await category_service_1.categoryService.listByHousehold(householdId);
    res.json(categories);
});
categoryController.post("/", async (req, res) => {
    try {
        const householdId = await resolveHouseholdId(String(req.body.householdId || ""));
        if (!householdId)
            return res.status(400).json({ error: "householdId is required" });
        const category = await category_service_1.categoryService.create({ ...req.body, householdId });
        res.status(201).json(category);
    }
    catch (error) {
        res.status(500).json({ error: "Unable to create category", details: String(error) });
    }
});
