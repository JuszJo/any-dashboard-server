import request from "supertest";

import dotenv from "dotenv";

dotenv.config();

import { app } from "..";
import { handleJWTSign } from "../middleware/auth.middleware";
import { createRefreshCookie, setAuthHeader } from "./test.utils";
import mongoose from "mongoose";
import { db } from "../config/db.config";

beforeAll(async () => {
    await mongoose.connect(db);
}, 1000 * 60);
  
afterAll(async () => {
    await mongoose.connection.close();
}, 1000 * 60);

describe("Auth API", () => {
    const payload = {
        id: "123456",
        role: "user",
        username: "joshua",
        email: "josh@mail.com",
        uuid: "654321"
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

    // it("should login successfully setting auth and cookies", async () => {
    //     const res = await request(app)
    //     .post("/api/login")
    //     .send({
    //         username: "joshua",
    //         password: "123456",
    //     })

    //     const body = res.body as {message: string, token: string};

    //     expect(res.status).toBe(200);
    //     expect(res.headers["set-cookie"]).toBeDefined();
    //     expect(body.token).toBeDefined();
    // });
    
    it("should deny login due to validation error", async () => {
        const res = await request(app)
        .post("/api/login")
        .send({
            username: "jo",
            password: "12",
        })

        const body = res.body as {message: string};

        console.log(body);

        expect(res.status).toBe(400);
        expect(body.message).toBe("validation error");
    });

    it("should deny login due to wrong credentials", async () => {
        const res = await request(app)
        .post("/api/login")
        .send({
            username: "joshua",
            password: "123456",
        })

        const body = res.body as {message: string};

        expect(res.status).toBe(401);
        expect(body.message).toBe("unauthorized");
    });
});