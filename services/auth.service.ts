import { Request, Response } from "express";
import bcrypt from "bcrypt";

import { handleJWTSign, handleJWTBearer, handleJWTCookie } from "../middleware/auth.middleware";
import { VerifiedPayload } from "../types/types";
import { LoginCredentials } from "../validators/login.validator";
import UserModel from "../models/user.model";
import { SignupCredentials } from "../validators/signup.validator";

export async function comparePassword(password: string, storedPassword: string) {
    try {
        const result = await bcrypt.compare(password, storedPassword);

        return result;
    } catch (error) {
        throw error;
    }
}

export async function hashPassword(password: string) {
    const saltRounds = 10;

    try {
        const salt = await bcrypt.genSalt(saltRounds);

        const hashedPassword = await bcrypt.hash(password, salt);

        return hashedPassword

    } catch (error) {
        throw error;
    }
}

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

export async function checkUser(data: LoginCredentials) {
    try {
        const user = await UserModel.findOne({ username: data.username });

        if (user == null || !user) {
            return null;
        }

        const isValid = await comparePassword(data.password, user.password);

        if (!isValid) {
            return null;
        }

        const { password, __v, _id, ...rest } = user.toObject()

        const id = _id.toString();

        const payload: VerifiedPayload = { id, ...rest };

        return payload;
    }
    catch (error) {
        throw error;
    }
}

export async function saveUser(data: SignupCredentials) {
    try {
        const hashedPassword = await hashPassword(data.password);

        const user = new UserModel({ ...data, password: hashedPassword, role: "user" });

        await user.save();

        const { password, __v, _id, ...rest } = user.toObject();

        const id = _id.toString();

        const payload: VerifiedPayload = { id, ...rest };

        return payload;
    }
    catch (error) {
        throw error;
    }
}

export async function saveUserProfile(userId: string, fullName: string) {
    try {
        const result = await UserModel.updateOne({_id: userId}, {
            $set: {
                fullName: fullName
            }
        })

        if(result.modifiedCount < 1) {
            console.log("nothing to modify");
            
            return false;
        }

        return true;
    }
    catch (error) {
        throw error;
    }
}