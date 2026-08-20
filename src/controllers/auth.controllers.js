const jwt = require("jsonwebtoken");
const userModel = require("../models/user.models");

async function registerUser(req, res) {
  const { name, mobile_number, password, role } = req.body;

  try {
    const user = await userModel.create({
      name,
      mobile_number,
      password,
      role,
    });

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
    );

    res.cookie("token", token);

    res.status(200).json({ message: "user created successfully" });
  } catch (error) {
    res.status(500).json({
      message: "error in creating user",
      error: error.message,
    });
  }
}

async function loginUser(req, res) {
  const { mobile_number, password, role } = req.body;

  try {
    const user = await userModel.findOne({ mobile_number, password });

    if (!user) {
      return res.status(401).json({
        message: "invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
    );

    res.cookie("token", token);

    res.status(200).json({ message: "user logged in successfully", user });
  } catch (error) {
    res.status(500).json({
      message: "error in login",
      error: error.message,
    });
  }
}

module.exports = {
  registerUser,
  loginUser,
};
