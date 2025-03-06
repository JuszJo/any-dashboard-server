import express from "express";

export interface UserCredentials {
    email: string,
    password: string,
}

export interface UserSignupCredentials {
    email: string,
    password: string,
}

export interface Payload {
    email?: string,
    username: string,
    role: string,
    id: string,
    iat?: number,
    exp?: number
}

export interface VerifiedPayload {
    email?: string,
    username: string,
    role: string,
    id: string,
}