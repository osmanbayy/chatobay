import mongoose from "mongoose";

export const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected: ", conn.connection.host);
  } catch (error) {
    console.error("Error Connecting to MongoDB: ", error);
    process.exit(1);    // 1 status code means fail, 0 means success    
  }
}