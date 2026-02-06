require("colors");
const mongoose = require("mongoose");

module.exports = async () => {
  const mongoURI = process.env.MONGODB_TOKEN;

  if (!mongoURI) {
    console.warn("[DATABASE] ⚠️ No MongoDB URI found, skip connection.".yellow);
    return;
  }

  mongoose.set("strictQuery", true);

  mongoose.connection.on("connected", () => {
    console.log("[DATABASE] 📂 MongoDB connected.".green);
  });

  mongoose.connection.on("error", (err) => {
    console.error("[DATABASE] ❌ MongoDB connection error:".red, err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[DATABASE] ❗MongoDB disconnected.".red);
  });

  try {
    await mongoose.connect(mongoURI);
  } catch (err) {
    console.error("[DATABASE] 🚫 Failed to connect to MongoDB:".red, err.message);
  }
};