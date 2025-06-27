// utils/connectDb.js or database/db.js
import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL, {
    
    });

    const dbName = conn.connection.name;
    const host = conn.connection.host;
    console.log(`✅ MongoDB connected: ${host} / DB: ${dbName}`);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // 💥 Exit with failure code
  }
};

export default connectDb;
