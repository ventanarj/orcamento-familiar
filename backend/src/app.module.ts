import { Router } from "express";
import { transactionController } from "./api/transaction/transaction.controller";
import { budgetController } from "./api/budget/budget.controller";
import { accountController } from "./api/account/account.controller";
import { categoryController } from "./api/category/category.controller";
import { householdController } from "./api/household/household.controller";

const appRouter = Router();

appRouter.use("/transactions", transactionController);
appRouter.use("/budget", budgetController);
appRouter.use("/accounts", accountController);
appRouter.use("/categories", categoryController);
appRouter.use("/households", householdController);

export { appRouter };
