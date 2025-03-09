import { Request, Response } from "express";
import { handleError } from "../utils/handleError";
import { LoginCredentials, LoginValidator } from "../validators/login.validator";
import { checkUser, handleLoginTokens, saveUser, saveUserProfile } from "../services/auth.service";
import { SignupCredentials, SignupValidator } from "../validators/signup.validator";
import UserModel from "../models/user.model";

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

        const accessToken = handleLoginTokens(req, res, payload);

        res.status(200).json({ message: "login successful", token: accessToken });
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

        const accessToken = handleLoginTokens(req, res, payload);

        res.status(201).json({ message: "signup successful", token: accessToken });
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

        const {__v, password, ...rest} = profile.toObject();

        const profileData = rest;

        res.status(200).json({ message: "successful", data: profileData });
    }
    catch (error) {
        handleError(res, error);
    }
}