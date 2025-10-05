// routes/adminRoutes.js
import express from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { getAdminDashboard,
    listUsers,
    addUser,
    editUser,
    deleteUser,
    getAllRoutes,
  getRouteById,
  addRoute,
  updateRoute,
  deleteRoute,
  assignRouteToStudent
} from "../controllers/adminController.js";

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
router.use(authorizeRole("admin"));

router.get("/dashboard", getAdminDashboard);
router.get("/users", listUsers);
router.post("/users", addUser);
router.put("/users/:user_id", editUser);
router.delete("/users/:user_id",deleteUser);
router.get("/routes", getAllRoutes);            
router.get("/routes/:route_id", getRouteById);  
router.post("/routes", addRoute);               
router.put("/routes/:route_id", updateRoute);   
router.delete("/routes/:route_id", deleteRoute);
router.post("/student-routes", assignRouteToStudent); 
export default router;
