import bcrypt from "bcrypt";
import { z } from "zod";
import prisma from "../utils/prisma.js";
import { AppError } from "../utils/AppError.js";
import { createAccessToken, createRefreshToken } from "../utils/jwt.js";

export async function registerUser(username: string, email: string, password: string) {
    const existing = await prisma.user.findFirst({
        where: { OR: [{ username }, { email }] },
    });

    if (existing) {
        throw new AppError(409, "Username or email already exists.");
    }

    return prisma.user.create({
        data: {
            username,
            email,
            passwordHash: await bcrypt.hash(password, 10),
        },
    });
}

export async function authenticateUser(identifier: string, password: string) {
    const isEmail = z.email().safeParse(identifier).success;

    const user = await prisma.user.findFirst({
        where: isEmail ? { email: identifier } : { username: identifier },
    });

    if (!user) {
        throw new AppError(404, "Invalid Credentials.");
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
        throw new AppError(401, "Invalid credentials.");
    }

    return user;
}

export async function issueTokensForUser(user: { id: number; username: string }) {
    const payload = { userId: String(user.id), username: user.username };

    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
        data: {
            userId: user.id,
            tokenHash: await bcrypt.hash(refreshToken, 10),
            expiresAt,
        },
    });

    return { accessToken, refreshToken };
}
