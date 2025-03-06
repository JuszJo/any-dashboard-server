import { Response, NextFunction, Request, CookieOptions } from "express";
import jwt from "jsonwebtoken"
import { Payload, VerifiedPayload } from "../types/types";

export function getCookies(cookieHeader: string) {
    const cookies = cookieHeader.split(';').reduce((prev: any, current) => {
        const [name, value] = current.trim().split('=');

        prev[name] = decodeURIComponent(value);

        return prev;
    }, {});

    return cookies;
}

export function extractToken(authHeader?: string) {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }

    return authHeader.split(" ")[1];
};

function handleNoTokens(res: Response) {
    res.status(401).json({ message: "unauthorized, no token" });
}

function handleNoRefresh(res: Response) {
    res.status(401).json({ message: "tokens expired" });
}

function handleRefreshTokenError(res: Response, error: any) {
    if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({ message: "tokens expired" });
    }
    else if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({ messsage: "invalid refresh token, unauthorized" });
    }
    else {
        console.log(error);

        res.status(500).json({ message: "error" });
    }
}

function handleJWTVerify(token: string, secret: string) {
    const { iat, exp, ...rest } = jwt.verify(token, secret) as Payload

    return rest as VerifiedPayload;
}

export function handleJWTSign(payload: VerifiedPayload, secret: string, expiresIn: number) {
    const newToken = jwt.sign(payload, secret, {
        expiresIn: expiresIn
    })

    return newToken;
}

function handleJWTCookie(tokenName: string, token: string, res: Response, options: CookieOptions) {
    res.cookie(tokenName, token, options);
}

// CONCRETE
function handleUpdateTokens(req: Request, res: Response, refreshToken: string) {
    // Assert type of process.env.JWT_SECRET
    const secret: string | undefined = process.env.JWT_SECRET as string;
    const refreshSecret = process.env.REFRESH_SECRET as string;

    const newPayload = handleJWTVerify(refreshToken, refreshSecret);

    const newToken = handleJWTSign(newPayload, secret, 60 * 60 * 24);

    const newRefreshToken = handleJWTSign(newPayload, refreshSecret, 60 * 60 * 24 * 7);

    handleJWTCookie("token", newToken, res, {
        maxAge: 60000 * 60 * 24,
        httpOnly: true
    })

    handleJWTCookie("refreshToken", newRefreshToken, res, {
        maxAge: 60000 * 60 * 24 * 7,
        httpOnly: true
    })

    req.user = newPayload;
}

export function verifyTokenMiddleware(req: Request, res: Response, next: NextFunction) {
    const cookieHeader = req.headers.cookie;

    const cookies = cookieHeader == undefined ? undefined : getCookies(cookieHeader);

    const token = cookies?.token;
    const refreshToken = cookies?.refreshToken;

    if (!token && !refreshToken) {
        console.log("NO ACCESS & REFRESH");

        handleNoTokens(res);

        return;
    }

    if (token) {
        try {
            // Assert type of process.env.JWT_SECRET
            const secret: string | undefined = process.env.JWT_SECRET as string;

            req.user = handleJWTVerify(token, secret);

            return next();
        }
        catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                console.log("ACCESS EXPIRED, CHEKING REFRESH");

                if (!refreshToken) {
                    console.log("ACCESS EXPIRED, NO REFRESH");

                    handleNoRefresh(res);

                    return;
                }

                try {
                    handleUpdateTokens(req, res, refreshToken);

                    return next();
                }
                catch (error) {
                    handleRefreshTokenError(res, error);

                    return;
                }
            }
            else if (error instanceof jwt.JsonWebTokenError) {
                res.status(401).json({ messsage: "invalid token, unauthorized" });

                return;
            }
            else {
                console.log(error);

                res.status(500).json({ message: "error" });

                return;
            }
        }
    }

    if (refreshToken) {
        console.log("NO ACCESS BUT REFRESH");

        try {
            handleUpdateTokens(req, res, refreshToken);

            return next();
        }
        catch (error) {
            handleRefreshTokenError(res, error);

            return;
        }
    }
}