require("colors");
const mongoose = require("mongoose");
const mongoURI = process.env.MONGODB_TOKEN;

module.exports = async (client) => {

  console.clear();
  const asciiArt = `
  ____                   ____             
 / ___| _   _ _ __ __  _|  _ \\  _____   __
 \\___ \\| | | | '_ \\\\ \\/ / | | |\/ _ \\ \\ / /
  ___) | |_| | | | |>  <| |_| |  __/\\ V / 
 |____/ \\__, |_| |_/_/\\_\\____/ \\___| \\_/  
        |___/                              
`;

  console.log(asciiArt.blue);

  console.log(`🤖 ${client.user.username} is online.\n`.blue);
  if (!mongoURI) {
    console.warn("⚠️ No MongoDB URI found, skip connection.".yellow);
    return;
  }
  mongoose.set("strictQuery", true);

  mongoose.connection.on("connected", () => {
    console.log("📂 MongoDB connected.".green);
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB connection error:".red, err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("❗MongoDB disconnected.".red);
  });

  try {
    await mongoose.connect(mongoURI);
  } catch (err) {
    console.error("🚫 Failed to connect to MongoDB:".red, err.message);
  }
  
};
