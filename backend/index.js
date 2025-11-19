import express from "express";
import routes from "./routes.js";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173";

const app = express();

// Configure CORS to only allow requests from the frontend
app.use(
	cors({
		origin: FRONTEND_ORIGIN,
		credentials: false,
	})
);

app.use(express.json());
app.use('', routes);

export default app;