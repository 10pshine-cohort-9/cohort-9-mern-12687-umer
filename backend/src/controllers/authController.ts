import crypto from "crypto";
import type { NextFunction, Request, Response } from 'express';
import {
  registerUser,
  authenticateUser,
  issueTokensForUser,
} from '../services/auth.service.js';
import logger from '../services/logger.js';
import prisma from "../utils/prisma.js";
import { hash } from "crypto";

function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { username, email, password } = req.body;

    const user = await registerUser(username, email, password);
    const { accessToken, refreshToken } = await issueTokensForUser(user);
    setRefreshCookie(res, refreshToken);

    logger.info('User registered successfully.');

    return res.status(201).json({
      success: true,
      msg: 'User registered successfully.',
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { identifier, password } = req.body;

    const user = await authenticateUser(identifier, password);
    const { accessToken, refreshToken } = await issueTokensForUser(user);
    setRefreshCookie(res, refreshToken);

    logger.info('Logged in successfully.');

    return res.json({
      success: true,
      msg: 'Logged in successfully.',
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
}



export async function logout(req: Request, res: Response) {
  const refreshToken = req.cookies?.refreshToken;
  if (refreshToken) {
    const hashedToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
    try {
      await prisma.refreshToken.deleteMany({
        where: {
          tokenHash: hashedToken,
        },
      });
    } catch (err) {
      console.error("Failed to delete refresh token from database during logout:", err);
    }
  }
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  return res.json({
    success: true,
    msg: "Logged out successfully.",
  });
}