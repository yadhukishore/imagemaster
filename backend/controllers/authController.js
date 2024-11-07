//authController.js
import { AppError, AppResponse } from "../utils/appUtils.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import Resetoken from "../models/resetPasswordModel.js";
import sendMail from "../utils/sendMail.js";
import mongoose from "mongoose";
import crypto from "crypto"; 

// Handle user signup/register
export const registerUser = async (req, res, next) => {
  try {
    const { email, phone, password } = req.body;

    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!email || !phone || !password) {
      throw new AppError(400, "Email, phone and password is required");
    }

    const userExist = await User.findOne({ email: trimmedEmail });

    if (userExist) {
      throw new AppError(409, "User already exist");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email: trimmedEmail,
      phone: trimmedPhone,
      password: hashedPassword,
    });

    await newUser.save();

    new AppResponse(res, 201, "New user is created");
  } catch (error) {
    next(error);
  }
};

// Handle user login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const trimmedEmail = email.trim();

    if (!email || !password) {
      throw new AppError(400, "Email and password are required");
    }

    const user = await User.findOne({ email: trimmedEmail });

    if (!user) {
      throw new AppError(404, "User do not exist");
    }

    const passwordValid = await bcrypt.compare(password, user.password || "");

    if (!passwordValid) {
      throw new AppError(401, "Invalid password, please try again");
    }

    const payload = {
      userId: user._id,
      iat: Date.now(),
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    await user.save();

    new AppResponse(res, 200, "User logged in successfully", {
      token,
      userData: {
        isUser: true,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Handle send reset password link
export const sendResetPasswordLink = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError(400, "Email and password are required");
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    await Resetoken.deleteMany({ email });

    const newToken = new Resetoken({
      email,
      token: resetToken,
      expiresIn: Date.now() + 3600000,
    });

    const resetUrl = `${process.env.CLIENT_BASE_URL}/reset-password?token=${resetToken}`;

    await newToken.save();

    sendMail(res, email, resetUrl);
  } catch (error) {
    next(error);
  }
};

// Handle reset password
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token) {
      throw new AppError(404, "Token not found");
    }

    // Check reset token
    const doc = await Resetoken.findOne({
      token,
      expiresIn: { $gt: Date.now() },
    });

    if (!doc) {
      throw new AppError(
        400,
        "The token is invalid or has expired. Please request a new password reset link."
      );
    }

    const user = await User.findOne({
      email: doc?.email,
    });

    if (!user) {
      return res.status(400).send("");
    }

    // Update the user's password and clear the reset token
    const hashedPassword = await bcrypt.hash(password, 10);
    await Resetoken.deleteOne({ token });

    user.password = hashedPassword;

    await user.save();

    new AppResponse(res, 200, "Password updated successfully");
  } catch (error) {
    next(error);
  }
};
