import { Router, Request, Response } from "express";
import { accountService } from "../../domain/account/account.service";
import { householdService } from "../../domain/household/household.service";

const accountController = Router();

async function resolveHouseholdId(provided: string) {
  if (provided) return provided;
  const household = await householdService.getDefaultHousehold();
  return household?.id || "";
}

accountController.get("/", async (req: Request, res: Response) => {
  const householdId = await resolveHouseholdId(String(req.query.householdId || ""));
  if (!householdId) return res.status(400).json({ error: "householdId is required" });
  const accounts = await accountService.listByHousehold(householdId);
  res.json(accounts);
});

accountController.post("/", async (req: Request, res: Response) => {
  try {
    const householdId = await resolveHouseholdId(String(req.body.householdId || ""));
    if (!householdId) return res.status(400).json({ error: "householdId is required" });
    const account = await accountService.create({ ...req.body, householdId });
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ error: "Unable to create account", details: String(error) });
  }
});

export { accountController };
