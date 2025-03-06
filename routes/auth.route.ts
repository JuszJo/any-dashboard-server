import express from "express";
import { verifyTokenMiddleware } from "../middleware/auth.middleware";
import { handleLogin, handleSignup } from "../controller/auth.controller";

const router = express.Router();

router.get("/auth", verifyTokenMiddleware);
router.get("/login", handleLogin);
router.get("/signup", handleSignup);

export default router;