import express from "express";
import { verifyTokenMiddleware } from "../middleware/auth.middleware";
import { handleLogin, handleProfile, handleSignup } from "../controllers/auth.controller";

const router = express.Router();

router.get("/auth", verifyTokenMiddleware);
router.post("/login", handleLogin);
router.post("/signup", handleSignup);
router.post("/profile",verifyTokenMiddleware, handleProfile);

export default router;