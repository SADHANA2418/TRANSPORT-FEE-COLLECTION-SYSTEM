import express from "express";
import {
  getDashboard,
  getFeeInfo,
  getPaymentHistory,
  getProfile,
  updateProfile,
  getFeeOptions,
  createPaymentOrder,
  verifyPayment
} from "../controllers/studentController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const authorizeRole = (role) => {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: "Access forbidden: insufficient permissions" });
    }
    next();
  };
};

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRole("student"));
import { downloadReceipt } from "../controllers/studentController.js";


router.get("/download-receipt/:paymentId", downloadReceipt);


router.get("/dashboard",  getDashboard);
router.get("/fee", getFeeInfo);
router.get("/fee/history", getPaymentHistory);
router.get("/fee/options", getFeeOptions);
router.post("/fee/create-order", createPaymentOrder);
router.post("/fee/verify", verifyPayment);
router.get("/profile",  getProfile);
router.put("/profile",  updateProfile);
import { testReceiptUpload } from "../controllers/studentController.js";

router.get("/test-receipt", testReceiptUpload);
export default router;
