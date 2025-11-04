import express from "express";
import "dotenv/config";
import path from "path"
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDatabase } from "./lib/database.js";
import { ENV } from "./lib/env.js";

const PORT = ENV.PORT || 3000;

const app = express();
const __dirname = path.resolve();

app.use(express.json());    // request.body
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

// Make ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("*", (request, response) => {
    response.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT} port.`);
  connectDatabase();
});