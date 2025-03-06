import { Request, Response } from "express";
import { handleError } from "../utils/handleError";
import { LoginCredentials, LoginValidator } from "../validators/login.validator";
import { checkUser, handleLoginTokens, saveUser } from "../services/auth.service";
import { SignupCredentials, SignupValidator } from "../validators/signup.validator";

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