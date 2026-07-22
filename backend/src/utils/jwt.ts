import jwt from "jsonwebtoken"
import process from "process"
import type { AccessTokenPayload } from "../types/jwt.js";

const ACCESS_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

export function createAccessToken(payload: {userId: string, username: string}) {
    const {userId, username} = payload;
    return jwt.sign(
        { userId, username },
        ACCESS_SECRET,
        { expiresIn: "15m" }
    );
}

export function createRefreshToken(payload: {userId: string, username: string}) {
    const {userId, username} = payload;
    return jwt.sign(
        { userId, username },
        REFRESH_SECRET,
        { expiresIn: "7d" }
    );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(
        token,
        ACCESS_SECRET
    ) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string) {
    return jwt.verify(token, REFRESH_SECRET);
}