import { Router } from "express";
import categoriesController from "../controllers/categories.controller";
import upload from "../middlewares/upload";

const router = Router();

// Public routes (read-only)
router.get("/", categoriesController.getAllCategories);
router.get("/:id", categoriesController.getCategoryById);

// Protected routes (require authentication)
router.post("/", upload.single('image'), categoriesController.createCategory);
router.put("/:id", upload.single('image'), categoriesController.updateCategory);
router.delete("/:id", categoriesController.deleteCategory);

export default router;