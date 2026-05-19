"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_2 = require("express");
const app_module_1 = require("./app.module");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3333;
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, express_2.json)());
app.use("/api", app_module_1.appRouter);
app.get("/", (_req, res) => {
    res.send({ status: "ok", service: "orcamento-familiar-backend" });
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
