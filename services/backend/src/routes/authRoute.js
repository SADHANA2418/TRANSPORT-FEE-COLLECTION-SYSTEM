import express from "express";
import * as authController from "../controllers/authController.js";

const router = express.Router();


router.post("/check-user", authController.checkUser);
router.post("/set-password", authController.setPassword);
router.post("/login", authController.login);
router.post("/request-setpassword", authController.requestPasswordReset);
router.post("/reset-password", authController.resetPassword);
router.post("/logout", authController.logout);

export default router;
