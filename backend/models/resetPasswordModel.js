import { Schema, model } from "mongoose";

const resetPasswordToken = new Schema(
  {
    email: {
      type: String,
      trim: true,
      required: true,
    },
    token: {
      type: String,
      trim: true,
      required: true,
    },
    expiresIn: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const Resetoken = model("Resetoken", resetPasswordToken);

export default Resetoken;
