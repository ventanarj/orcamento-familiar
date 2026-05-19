import { Router, Request, Response } from "express";
import { categoryService } from "../../domain/category/category.service";
import { householdService } from "../../domain/household/household.service";

const categoryController = Router();

async function resolveHouseholdId(provided: string) {
  if (provided) return provided;
  const household = await householdService.getDefaultHousehold();
  return household?.id || "";
}

categoryController.get("/", async (req: Request, res: Response) => {
  const householdId = await resolveHouseholdId(String(req.query.householdId || ""));
  if (!householdId) return res.status(400).json({ error: "householdId is required" });
  const categories = await categoryService.listByHousehold(householdId);
  res.json(categories);
});

categoryController.post("/", async (req: Request, res: Response) => {
  try {
    const householdId = await resolveHouseholdId(String(req.body.householdId || ""));
    if (!householdId) return res.status(400).json({ error: "householdId is required" });
    const category = await categoryService.create({ ...req.body, householdId });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: "Unable to create category", details: String(error) });
  }
});

export { categoryController };
