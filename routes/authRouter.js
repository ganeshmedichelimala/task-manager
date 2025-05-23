const { Router } = require("express");
const authRouter = Router();
const userModel = require("../db/db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

authRouter.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const userExist = await userModel.findOne({ email });
    if (userExist) {
      return res
        .status(409)
        .json({ message: "User already exists, please signin" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new userModel({
      name,
      email,
      password: hashedPassword,
      tasks: [],
    });
    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_PASSWORD
    );

    res.status(201).json({
      message: "Signed up successfully",
      user: { id: user._id, name, email },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error while signing up" });
  }
});

authRouter.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ message: "No user exists with this email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_PASSWORD || "secret_key"
    );

    res.status(200).json({
      message: "Logged in successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Unable to Signin, please try again later" });
  }
});

module.exports = authRouter;
