import express from "express";
import "dotenv/config";
import path from "path"
import cookieParser from "cookie-parser";
import cors from "cors";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { connectDatabase } from "./lib/database.js";
import { ENV } from "./lib/env.js";
import { app, server } from "./lib/socket.js";

const PORT = ENV.PORT || 3000;

const __dirname = path.resolve();

app.use(express.json({limit: "10mb"}));    // request.body
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }))
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

server.listen(PORT, () => {
  console.log(`Server is running on ${PORT} port.`);
  connectDatabase();
});