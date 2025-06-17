// filepath: /Users/resetstudios03/Desktop/streaming/backend/routes/searchRoutes.js
import express from "express";
import { unifiedSearch } from "../controllers/searchController.js";

const router = express.Router();

router.get("/", unifiedSearch);

export default router;