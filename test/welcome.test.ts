import request from "supertest";

import dotenv from "dotenv";

dotenv.config();

import { app } from "..";
import { handleJWTSign } from "../middleware/auth.middleware";

function setAuthHeader(token: string) {
    return `Bearer ${token}`
}

function createRefreshCookie(token: string) {
    return `refreshToken=${token}; Path=/; HttpOnly`;
}

describe("Welcome Message API", () => {
    const payload = {
        id: "123456",
        role: "user",
        username: "joshua",
        email: "josh@mail.com"
    };

    const secret: string | undefined = process.env.JWT_SECRET as string;
    const refreshSecret = process.env.REFRESH_SECRET as string;

    const token = handleJWTSign(payload, secret, 60 * 60);

    it("should show a welcome message", async () => {
        const res = await request(app)
        .get("/api/welcome")
        .set("Authorization", setAuthHeader(token))

        expect(res.status).toBe(200);
        expect(res.text).toBe("welcome");
    });
});

describe("Auth API", () => {
    const payload = {
        id: "123456",
        role: "user",
        username: "joshua",
        email: "josh@mail.com"
    };

    const refreshSecret = process.env.REFRESH_SECRET as string;
    const refreshToken = handleJWTSign(payload, refreshSecret, 60 * 60);
    const refreshCookie = createRefreshCookie(refreshToken);

    it("should deny access", async () => {
        const res = await request(app)
        .get("/api/welcome")

        expect(res.status).toBe(401);
    });

    it("should deny access (invalid token)", async () => {
        const res = await request(app)
        .get("/api/welcome")
        .set("Authorization", setAuthHeader("invalid"));

        expect(res.status).toBe(401);
    });

    it("should deny access (no token) but use refresh", async () => {
        const res = await request(app)
        .get("/api/welcome")
        .set("Authorization", setAuthHeader(""))
        .set("Cookie", refreshCookie)

        expect(res.status).toBe(200);
        expect(res.headers["authorization"]).toBeDefined();
        expect(res.headers["authorization"]).toContain("Bearer ");
    });

    const refreshToken2 = handleJWTSign(payload, refreshSecret, 1);
    const refreshCookie2 = createRefreshCookie(refreshToken2);

    it("should deny access (no token) and deny refresh (expired)", async () => {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // wait for 2 seconds to let token expire

        const res = await request(app)
        .get("/api/welcome")
        .set("Authorization", setAuthHeader(""))
        .set("Cookie", refreshCookie2)

        expect(res.status).toBe(401); 
        expect(res.text).toBe(JSON.stringify({ message: "tokens expired" }));
    });

    const refreshCookie3 = createRefreshCookie("dss");

    it("should deny access (no token) and deny refresh (invalid)", async () => {
        const res = await request(app)
        .get("/api/welcome")
        .set("Authorization", setAuthHeader(""))
        .set("Cookie", refreshCookie3)

        expect(res.status).toBe(401); 
        expect(res.text).toBe(JSON.stringify({ messsage: "invalid refresh token, unauthorized" }));
    });
});

// TODO: ADD LOGIN AND SIGNUP