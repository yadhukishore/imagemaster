import { Router } from "express";
import {
  deleteImages,
  editImage,
  getImages,
  updateImageOrder,
  uploadImages,
} from "../controllers/imageController.js";
import {
  loginUser,
  registerUser,
  resetPassword,
  sendResetPasswordLink,
} from "../controllers/authController.js";
import processImages from "../middlewares/processImageMiddleware.js";
import upload from "../middlewares/multerMiddleware.js";
import { authorizeUser, isLoggedIn } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/auth/user", isLoggedIn);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", sendResetPasswordLink);
router.post("/reset-password", resetPassword);
router
  .route("/images")
  .get(authorizeUser, getImages)
  .post(authorizeUser, upload.array("images"), processImages, uploadImages)
  .put(authorizeUser, updateImageOrder)
  .delete(authorizeUser, deleteImages);
router.patch(
  "/images/:imageId",
  authorizeUser,
  upload.array("images"),
  processImages,
  editImage
);

export default router;
