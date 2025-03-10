import { Request, Response } from "express";
import { handleError } from "../utils/handleError";
import { LoginCredentials, LoginValidator } from "../validators/login.validator";
import { checkUser, handleLoginTokens, saveUser, saveUserProfile } from "../services/auth.service";
import { SignupCredentials, SignupValidator } from "../validators/signup.validator";
import UserModel from "../models/user.model";
import { handleJWTSign, handleJWTVerify } from "../middleware/auth.middleware";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

import dotenv from "dotenv";

dotenv.config();

export async function handleRefresh(req: Request, res: Response) {
    try {
        if (!req.body.refreshToken) {
            res.status(403).json({ message: "no refresh token" });

            return;
        }

        const secret = process.env.JWT_SECRET as string;
        const refreshSecret = process.env.REFRESH_SECRET as string;
        const refreshToken = req.body.refreshToken as string;

        const newPayload = handleJWTVerify(refreshToken, refreshSecret);

        const newToken = handleJWTSign(newPayload, secret, 60 * 60 * 24);

        const newRefreshToken = handleJWTSign(newPayload, refreshSecret, 60 * 60 * 24 * 7);

        res.status(201).json({ message: "tokens generated successfully", accessToken: newToken, refreshToken: newRefreshToken })
    }
    catch (error) {
        if (error instanceof JsonWebTokenError) {
            res.status(401).json({ messsage: "invalid token, unauthorized" });
        }
        else if (error instanceof TokenExpiredError) {
            res.status(401).json({ message: "refresh token expired" });
        }
        else {
            handleError(res, error);
        }
    }
}

export async function handleLogin(req: Request, res: Response) {
    try {
        const loginCredentials = req.body as LoginCredentials;

        const validated = LoginValidator.parse(loginCredentials);

        const response = await checkUser(validated);

        if (!response) {
            res.status(401).json({ message: "unauthorized" });

            return;
        }

        const payload = response;

        const { accessToken, refreshToken } = handleLoginTokens(req, res, payload);

        res.status(200).json({ message: "login successful", accessToken, refreshToken });
    }
    catch (error) {
        handleError(res, error);
    }
}

export async function handleSignup(req: Request, res: Response) {
    try {
        const signupCredentials = req.body as SignupCredentials;

        const validated = SignupValidator.parse(signupCredentials);

        const response = await saveUser(validated);

        const payload = response;

        const { accessToken, refreshToken } = handleLoginTokens(req, res, payload);

        res.status(201).json({ message: "signup successful", accessToken, refreshToken });
    }
    catch (error) {
        handleError(res, error);
    }
}

export async function handlePostProfile(req: Request, res: Response) {
    try {
        const profileCredentials = req.body as { fullName: string };

        if (!profileCredentials.fullName || typeof profileCredentials.fullName != "string") {
            res.status(400).json({ message: "validation error", fullName: "invalid value" });

            return;
        }

        const validated = profileCredentials.fullName;

        const response = await saveUserProfile(req.user.id, validated);

        if (!response) {
            res.status(304).end();

            return;
        }

        res.status(201).json({ message: "profile creation successful" });
    }
    catch (error) {
        handleError(res, error);
    }
}

export async function handleGetProfile(req: Request, res: Response) {
    try {
        const profile = await UserModel.findById(req.user.id);

        if (!profile) {
            res.status(400).json({ message: "profile not found" });

            return;
        }

        const { __v, password, ...rest } = profile.toObject();

        const profileData = rest;

        res.status(200).json({ message: "successful", data: profileData });
    }
    catch (error) {
        handleError(res, error);
    }
}