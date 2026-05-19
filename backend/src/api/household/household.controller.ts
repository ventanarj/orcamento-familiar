import { Router, Request, Response } from "express";
import { householdService } from "../../domain/household/household.service";

const householdController = Router();

householdController.get("/default", async (_req: Request, res: Response) => {
  const household = await householdService.getDefaultHousehold();
  if (!household) return res.status(404).json({ error: "No household available" });
  res.json(household);
});

householdController.get("/", async (_req: Request, res: Response) => {
  const households = await householdService.list();
  res.json(households);
});

export { householdController };
