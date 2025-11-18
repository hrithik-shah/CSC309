import express from "express";
import routes from "./routes.js";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();

// Configure CORS to only allow requests from the frontend
const FRONTEND_ORIGIN = process.env.FRONTEND_URL || "http://localhost:5173";
const allowedOrigins = [
	FRONTEND_ORIGIN,
	"http://localhost:5173",
	"http://127.0.0.1:5173",
];

const corsOptions = {
	origin: (origin, callback) => {
		if (!origin) return callback(null, true); // allow non-browser clients
		if (allowedOrigins.includes(origin)) return callback(null, true);
		return callback(new Error("Not allowed by CORS"));
	},
	methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	allowedHeaders: ["Content-Type", "Authorization"],
	credentials: true,
	optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(express.json());
app.use('', routes);

export default app;