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

export async function postWithToken(route: string, data: any, app: Application) {
    const loginRes = await request(app)
    .post("/api/login")
    .send({
        username: "joshua",
        password: "123456"
    })

    const accessToken = loginRes.body.accessToken as string;

    const res = await request(app)
    .post(route)
    .send(data)
    .set("Authorization", setAuthHeader(accessToken))

    return res;
}

export async function getWithToken(route: string, app: Application) {
    const loginRes = await request(app)
    .post("/api/login")
    .send({
        username: "joshua",
        password: "123456"
    })

    const accessToken = loginRes.body.accessToken as string;

    const res = await request(app)
    .get(route)
    .set("Authorization", setAuthHeader(accessToken))

    return res;
}