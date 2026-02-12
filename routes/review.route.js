import express from "express";
import { addReview, getReviews } from "../controllers/review.controller.js";

const router = express.Router();

router.post("/:productId", addReview);
router.get("/:productId", getReviews);

export default router;
