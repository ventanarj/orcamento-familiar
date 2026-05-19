import express from "express";
import cors from "cors";
import helmet from "helmet";
import { json } from "express";
import { appRouter } from "./app.module";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3333;

app.use(helmet());
app.use(cors());
app.use(json());
app.use("/api", appRouter);

app.get("/", (_req, res) => {
  res.send({ status: "ok", service: "orcamento-familiar-backend" });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
