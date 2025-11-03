import mongoose from "mongoose";
import { ENV } from "./env.js";

export const connectDatabase = async () => {
  try {
    const { MONGO_URI } = ENV;
    if(!MONGO_URI) throw new Error("MONGO_URI is not set.");

    const conn = await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected: ", conn.connection.host);
  } catch (error) {
    console.error("Error Connecting to MongoDB: ", error);
    process.exit(1);    // 1 status code means fail, 0 means success    
  }
}