import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables from .env
console.log(process.env.MONGO_URL);


const listIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB connected");

    const indexes = await mongoose.connection.db.collection("artists").indexes();
    console.log("📦 Indexes on 'artists' collection:");
    indexes.forEach((index) => {
      console.log(JSON.stringify(index, null, 2));
    });

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error listing indexes:", error.message);
    process.exit(1);
  }
};

listIndexes();
