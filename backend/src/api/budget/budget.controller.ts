import { Router, Request, Response } from "express";
import { budgetService } from "../../domain/budget/budget.service";
import { householdService } from "../../domain/household/household.service";

const budgetController = Router();

async function resolveHouseholdId(provided: string) {
  if (provided) return provided;
  const household = await householdService.getDefaultHousehold();
  return household?.id || "";
}

budgetController.get("/cycle", async (req: Request, res: Response) => {
  const householdId = await resolveHouseholdId(String(req.query.householdId || ""));
  if (!householdId) {
    return res.status(400).json({ error: "householdId is required" });
  }
  const cycle = await budgetService.getBudgetCycle(householdId);
  if (!cycle) {
    return res.status(404).json({ error: "No budget cycle found" });
  }
  res.json(cycle);
});

budgetController.get("/forecast", async (req: Request, res: Response) => {
  const householdId = await resolveHouseholdId(String(req.query.householdId || ""));
  if (!householdId) {
    return res.status(400).json({ error: "householdId is required" });
  }
  const forecast = await budgetService.getBudgetForecast(householdId);
  if (!forecast) {
    return res.status(404).json({ error: "No budget cycle found" });
  }
  res.json(forecast);
});

budgetController.get("/distribution", async (req: Request, res: Response) => {
  const budgetCycleId = String(req.query.budgetCycleId || "");
  if (!budgetCycleId) {
    return res.status(400).json({ error: "budgetCycleId is required" });
  }
  const distribution = await budgetService.calculateWeeklyDistribution(budgetCycleId);
  res.json(distribution);
});

export { budgetController };
