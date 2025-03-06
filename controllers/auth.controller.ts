import { Request, Response } from "express";
import { handleError } from "../utils/handleError";
import { LoginCredentials, LoginValidator } from "../validators/login.validator";
import { handleLoginTokens } from "../services/auth.service";
import { VerifiedPayload } from "../types/types";

export async function handleLogin(req: Request, res: Response) {
    try {
        const loginCredentials = req.body as LoginCredentials;

        const validated = LoginValidator.parse(loginCredentials);

        const payload: VerifiedPayload = {
            username: validated.username,
            email: validated.password,
            id: "123456",
            uuid: "654321",
            role: "user",
        }

        const accessToken = handleLoginTokens(req, res, payload);

        res.status(200).json({ message: "login successful", token: accessToken });
    }
    catch (error) {
        handleError(res, error);
    }
}

export async function handleSignup(req: Request, res: Response) {
    try {

    }
    catch (error) {

    }
}