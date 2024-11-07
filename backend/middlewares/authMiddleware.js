import { AppError, AppResponse } from "../utils/appUtils.js";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

export const authorizeUser = (req, res, next) => {
  if (!req.headers.authorization) {
    throw new AppError(401, "Token do not exist");
  }

  const [_, token] = req.headers.authorization.split(" ");

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      throw new AppError(401, "Unauthorized: Invalid token");
    }

    const user = await User.findOne({ _id: decoded.userId });

    if (!user) throw new AppError(401, "Unauthorized: User not found");

    req.userId = decoded.userId;

    next();
  });
};

export const isLoggedIn = (req, res, next) => {
  if (!req.headers.authorization) {
    throw new AppError(401, "Token do not exist");
  }

  const [_, token] = req.headers.authorization.split(" ");

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      throw new AppError(401, "Unauthorized: Invalid token");
    }

    const user = await User.findOne({ _id: decoded.userId });

    if (!user) throw new AppError(401, "Unauthorized: User not found");

    req.userId = decoded.userId;

    new AppResponse(res, 200, "User is logged-in", {
      userData: {
        isUser: true,
        email: user.email,
      },
    });
  });
};
