import { Application } from "express";
import request, { Response } from "supertest";

export function setAuthHeader(token: string) {
    return `Bearer ${token}`
}

export function createRefreshCookie(token: string) {
    return `refreshToken=${token}; Path=/; HttpOnly`;
}

export function withoutToken(res: Response) {
    const body = res.body as {message: string};

    console.log(body);
    
    expect(res.status).toBe(401);
    expect(body.message).toBe("unauthorized, no token");
}

export async function withToken(route: string, data: any, app: Application) {
    const loginRes = await request(app)
    .post("/api/login")
    .send({
        username: "joshua",
        password: "123456"
    })

    const token = loginRes.body.token as string;

    const res = await request(app)
    .post(route)
    .send(data)
    .set("Authorization", setAuthHeader(token))

    return res;
}