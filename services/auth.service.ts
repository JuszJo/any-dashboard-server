import { Request, Response } from "express"
import { handleJWTSign, handleJWTBearer, handleJWTCookie } from "../middleware/auth.middleware";
import { VerifiedPayload } from "../types/types";

export function handleLoginTokens(req: Request, res: Response, payload: VerifiedPayload) {
    const secret = process.env.JWT_SECRET as string;
    const refreshSecret = process.env.REFRESH_SECRET as string;

    const accessToken = handleJWTSign(payload, secret, 60 * 60 * 24);

    const refreshToken = handleJWTSign(payload, refreshSecret, 60 * 60 * 24 * 7);

    handleJWTBearer(accessToken, res);

    handleJWTCookie("refreshToken", refreshToken, res, {
        maxAge: 60000 * 60 * 24 * 7,
        httpOnly: true
    })

    req.user = payload;

    return accessToken;
}