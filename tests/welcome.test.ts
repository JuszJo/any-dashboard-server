import request from "supertest";

import dotenv from "dotenv";

dotenv.config();

import { app } from "..";
import { handleJWTSign } from "../middleware/auth.middleware";
import { setAuthHeader } from "./test.utils";

describe("Welcome Message API", () => {
    const payload = {
        id: "123456",
        role: "user",
        username: "joshua",
        email: "josh@mail.com",
        uuid: "654321"
    };

    const secret: string | undefined = process.env.JWT_SECRET as string;

    const token = handleJWTSign(payload, secret, 60 * 60);

    it("should show a welcome message", async () => {
        const res = await request(app)
        .get("/api/welcome")
        .set("Authorization", setAuthHeader(token))

        expect(res.status).toBe(200);
        expect(res.text).toBe("welcome");
    });
});