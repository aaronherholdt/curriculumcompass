import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

import { connectDB } from "./db/connectDB.js";

import authRoutes from "./routes/auth.route.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import childProfileRoutes from "./routes/childProfile.routes.js";
import lessonPlanRoutes from "./routes/lessonPlan.routes.js";
import paypalRoutes from "./routes/paypal.routes.js";
import worksheetRoutes from "./routes/worksheet.routes.js";
import curriculumRoutes from "./routes/curriculum.routes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const __dirname = path.resolve();

// Update CORS configuration for both development and production
const corsOptions = {
	origin: process.env.NODE_ENV === "production" 
		? [/\.vercel\.app$/, /localhost/] 
		: "http://localhost:5173",
	credentials: true
};

app.use(cors(corsOptions));

app.use(express.json()); // allows us to parse incoming requests:req.body
app.use(cookieParser()); // allows us to parse incoming cookies

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/child-profiles", childProfileRoutes);
app.use("/api/lesson-plans", lessonPlanRoutes);
app.use("/api/paypal", paypalRoutes);
app.use("/api/worksheets", worksheetRoutes);
app.use("/api", curriculumRoutes);

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/frontend/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
	});
}

app.listen(PORT, () => {
	connectDB();
	console.log("Server is running on port: ", PORT);
});
