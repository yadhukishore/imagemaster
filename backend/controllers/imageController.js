//imageController.js
import mongoose from "mongoose";
import ImageStack from "../models/imageModel.js";
import { AppError, AppResponse } from "../utils/appUtils.js";
import {
  deleteFileFromS3,
  getPreSignedUrl,
  uploadFilesToS3,
} from "../utils/S3Utils.js";

export const getImages = async (req, res, next) => {
  try {
    const { userId } = req;

    if (!userId) {
      throw new AppError(401, "User ID do not exist");
    }

    const stack = await ImageStack.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    let images = [];

    if (stack && stack?.images.length > 0) {
      images = await Promise.all(
        stack.images.map(async (image) => {
          const url = await getPreSignedUrl(image.imageKey);
          return { ...image._doc, url };
        })
      );
    }

    new AppResponse(res, 200, "Homepage loaded", {
      images,
    });
  } catch (error) {
    next(error);
  }
};

export const uploadImages = async (req, res, next) => {
  console.log("uploadImages!!!!")
  try {
    const { userId } = req;
    const { titles } = req.body;
    const images = req.files;

    if (!userId) {
      throw new AppError(401, "User ID do not exist");
    }

    if (images.length <= 0 || titles.length <= 0) {
      throw new AppError(400, "Images and Titles required");
    }

    // Upload images to s3
    const uploadedFiles = await uploadFilesToS3(images);

    // Find image stack
    const imageStack = await ImageStack.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    let nextOrder = 1;

    // Check duplicate titles. If not, find next order
    if (imageStack && imageStack.images.length > 0) {
      const duplicateTitles = [];

      // Check for duplicate titles
      for (const title of titles) {
        const imageExist = imageStack.images.find(
          (image) => image.title?.toLowerCase() === title?.toLowerCase()
        );

        if (imageExist) duplicateTitles.push(title);
      }
      if (duplicateTitles.length > 0) {
        throw new AppError(
          409,
          `Image with title ${duplicateTitles.join(", ")} alredy exist`
        );
      }
      nextOrder = imageStack.images.length + 1;
    }

    // Create modified array to save in stack
    const newImages = titles.map((title, index) => ({
      title,
      order: nextOrder + index,
      imageKey: uploadedFiles[index]?.key,
    }));

    // If image stack exists, update it, otherwise create a new stack
    if (imageStack) {
      imageStack.images.push(...newImages);
      await imageStack.save();
    } else {
      await ImageStack.create({
        userId: new mongoose.Types.ObjectId(userId),
        images: newImages,
      });
    }

    new AppResponse(res, 200, "Images uploaded");
  } catch (error) {
    next(error);
  }
};

export const updateImageOrder = async (req, res, next) => {
  try {
    const { userId } = req;
    const { images } = req.body;

    if (!userId) {
      throw new AppError(401, "User ID do not exist");
    }

    if (images.length <= 0) {
      throw new AppError(404, "Images are not found");
    }

    const imageStack = await ImageStack.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!imageStack) {
      throw new AppError(404, "ImageStack not found");
    }

    // Update the 'order' field for each image in the ImageStack
    images.forEach((updatedImage) => {
      const image = imageStack.images.id(updatedImage._id);
      if (image) {
        image.order = updatedImage.order;
      }
    });

    await imageStack.save();

    new AppResponse(res, 200, "Image order updated successfully");
  } catch (error) {
    next(error);
  }
};

export const editImage = async (req, res, next) => {
  try {
    const { userId } = req;
    const { title } = req.body;
    const { imageId } = req.params;
    const images = req.files;

    if (!userId) {
      throw new AppError(401, "User ID do not exist");
    }

    if (!title) {
      throw new AppError(400, "Title is required");
    }

    const imageStack = await ImageStack.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!imageStack) {
      throw new AppError(404, "ImageStack not found");
    }

    const imageToEdit = imageStack.images.id(imageId);
    const titleExist = imageStack.images.some(
      (obj) => obj.title.toLowerCase() === title.toLowerCase()
    );

    if (titleExist) {
      throw new AppError(400, "Image with this title already exist");
    }

    imageToEdit.title = title;

    let newImageUrl = "";

    // Handle when image needs to update
    if (images.length > 0) {
      // Delete previous image
      await deleteFileFromS3(imageToEdit.imageKey);

      // Upload new image
      const uploadedImage = await uploadFilesToS3(images);
      const newKey = uploadedImage[0]?.key;

      // Get url of uploaded image
      if (newKey) {
        newImageUrl = await getPreSignedUrl(newKey);

        imageToEdit.imageKey = newKey;
      }
    }

    await imageStack.save();

    new AppResponse(res, 200, "Image edited succesfully", {
      newImageUrl,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteImages = async (req, res, next) => {
  try {
    const { userId } = req;
    const { imageIds } = req.query;

    if (!userId) {
      throw new AppError(401, "User ID do not exist");
    }

    if (!imageIds) {
      throw new AppError(400, "Title is required");
    }

    const imageStack = await ImageStack.findOne({
      userId: new mongoose.Types.ObjectId(userId),
    });

    if (!imageStack) {
      throw new AppError(404, "ImageStack not found");
    }

    const keyOfImages = [];

    imageIds.forEach((id) => {
      const currImage = imageStack.images.id(id);
      keyOfImages.push(currImage.imageKey);

      imageStack.images.pull(id);
    });

    // Reorder images
    imageStack.images
      .sort((a, b) => a.order - b.order)
      .forEach((image, index) => {
        image.order = index + 1;
      });

    await imageStack.save();

    if (keyOfImages.length > 0) {
      Promise.all(
        keyOfImages.map(async (key) => {
          await deleteFileFromS3(key);
        })
      );
    }

    new AppResponse(res, 200, "Image edited succesfully");
  } catch (error) {
    next(error);
  }
};
