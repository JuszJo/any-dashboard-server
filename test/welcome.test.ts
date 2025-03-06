import request from "supertest";
import { app } from "..";

describe("Welcome Message API", () => {
    it("should show a welcome message", async () => {
        const res = await request(app).get("/api/welcome");

        expect(res.status).toBe(200);
        expect(res.text).toBe("welcome");
    });
});

// describe("Auth API", () => {
//     let token = "";

//     it("should register a user", async () => {
//         const res = await request(app).post("/api/auth/register").send({
//             email: "test@example.com",
//             password: "password123",
//         });

//         expect(res.status).toBe(201);
//         expect(res.body.token).toBeDefined();
//         token = res.body.token;
//     });

//     it("should login a user", async () => {
//         const res = await request(app).post("/api/auth/login").send({
//             email: "test@example.com",
//             password: "password123",
//         });

//         expect(res.status).toBe(200);
//         expect(res.body.token).toBeDefined();
//         token = res.body.token;
//     });

//     it("should access a protected route with valid token", async () => {
//         const res = await request(app)
//             .get("/api/protected")
//             .set("Authorization", `Bearer ${token}`);

//         expect(res.status).toBe(200);
//     });

//     it("should deny access without token", async () => {
//         const res = await request(app).get("/api/protected");
//         expect(res.status).toBe(401);
//     });
// });
