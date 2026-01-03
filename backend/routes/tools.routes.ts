import { Router } from "express";
import toolsController from "../controllers/tools.controller";
import upload from "../middlewares/upload";

const router = Router();

// Public routes (read-only)
router.get("/", toolsController.getAllTools);
router.get("/:id", toolsController.getToolById);

// Protected routes (require authentication)
router.post("/", upload.single('image'), toolsController.createTool);
router.put("/:id", upload.single('image'), toolsController.updateTool);
router.delete("/:id", toolsController.deleteTool);

export default router;