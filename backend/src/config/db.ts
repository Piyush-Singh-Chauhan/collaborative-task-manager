import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    const dbName = process.env.DBNAME;

    if (!mongoURI) {
      throw new Error("MongoDB URI is not defined.");
    }

     if (!dbName) {
      throw new Error("DBNAME is not defined.");
    }

    await mongoose.connect(mongoURI, {
      dbName: dbName,
    });

    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
