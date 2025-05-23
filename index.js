const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const authRouter = require("./routes/authRouter");
const taskRouter = require("./routes/taskRouter");
const MONGO_URL = process.env.MONGO_URL;
const app = express();
app.use(express.json());
app.use("/auth", authRouter);
app.use("/tasks", taskRouter);

async function main() {
  await mongoose.connect(MONGO_URL);
  app.listen(3000, () => console.log("Listening on  port 3000"));
  console.log("Connected to DB");
}

main();
