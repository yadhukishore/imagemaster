import mongoose, { Schema, model } from "mongoose";

const imageStackSchema = new Schema(
  {
    userId: {
      ref: "User",
      type: mongoose.Types.ObjectId,
      required: true,
    },
    images: [
      {
        title: {
          type: String,
          trim: true,
          required: true,
        },
        order: {
          type: Number,
          required: true,
        },
        imageKey: {
          type: String,
          trim: true,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const ImageStack = model("ImageStack", imageStackSchema);

export default ImageStack;
