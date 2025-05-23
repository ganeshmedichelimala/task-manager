const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const taskSchema = new Schema({
  title: String,
  description: String,
  status: {
    type: String,
    enum: ["completed", "pending"],
    default: "pending",
  },
});

const userSchema = new Schema({
  name: String,
  email: { type: String, require: true },
  password: { type: String, require: true },
  tasks: [taskSchema],
});

const userModel = mongoose.model("user", userSchema);

module.exports = userModel;
