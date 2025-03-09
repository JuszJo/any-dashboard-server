import express, { Request, Response } from "express";
import { verifyTokenMiddleware } from "../middleware/auth.middleware";
import { handleLogin, handlePostProfile, handleGetProfile, handleSignup } from "../controllers/auth.controller";

const router = express.Router();

router.get("/auth", verifyTokenMiddleware, (req: Request, res: Response) => { res.status(200).json({ message: "authenticated" }) });
router.post("/login", handleLogin);
router.post("/signup", handleSignup);
router.post("/profile", verifyTokenMiddleware, handlePostProfile);
router.get("/profile", verifyTokenMiddleware, handleGetProfile);

export default router;