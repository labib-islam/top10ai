import { Router } from "express";
import toolCategoryListingsController from "../controllers/tool-category-listings.controller";

const router = Router();

// Nested under categories
router.post("/categories/:categoryId/tools", toolCategoryListingsController.addToolToCategory);
router.get("/categories/:categoryId/tools", toolCategoryListingsController.getToolsByCategory);
router.get("/categories/:categoryId/tools/:toolId", toolCategoryListingsController.getToolCategoryListing);
router.put("/categories/:categoryId/tools/:toolId", toolCategoryListingsController.updateToolCategoryListing);
router.delete("/categories/:categoryId/tools/:toolId", toolCategoryListingsController.removeToolFromCategory);

// Nested under tools
router.get("/tools/:toolId/categories", toolCategoryListingsController.getCategoriesByTool);

export default router;

