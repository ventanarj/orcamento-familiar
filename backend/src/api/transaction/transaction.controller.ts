import { Router, Request, Response } from "express";
import { transactionService } from "../../domain/transaction/transaction.service";
import { householdService } from "../../domain/household/household.service";

const transactionController = Router();

async function resolveHouseholdId(provided: string) {
  if (provided) return provided;
  const household = await householdService.getDefaultHousehold();
  return household?.id || "";
}

transactionController.get("/", async (req: Request, res: Response) => {
  const householdId = await resolveHouseholdId(String(req.query.householdId || ""));
  if (!householdId) {
    return res.status(400).json({ error: "householdId is required" });
  }
  const list = await transactionService.listByHousehold(householdId);
  res.json(list);
});

transactionController.post("/", async (req: Request, res: Response) => {
  try {
    const householdId = await resolveHouseholdId(String(req.body.householdId || ""));
    if (!householdId) {
      return res.status(400).json({ error: "householdId is required" });
    }
    const transaction = await transactionService.create({ ...req.body, householdId });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ error: "Unable to create transaction", details: String(error) });
  }
});

transactionController.get("/forecast", async (req: Request, res: Response) => {
  const householdId = await resolveHouseholdId(String(req.query.householdId || ""));
  if (!householdId) {
    return res.status(400).json({ error: "householdId is required" });
  }
  const startDate = new Date(String(req.query.startDate || new Date().toISOString()));
  const endDate = new Date(String(req.query.endDate || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()));
  const projection = await transactionService.getCashFlowProjection(householdId, startDate, endDate);
  res.json(projection);
});

export { transactionController };
