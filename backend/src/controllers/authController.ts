import crypto from "crypto";
import type { NextFunction, Request, Response } from 'express';
import {
  registerUser,
  authenticateUser,
  issueTokensForUser,
} from '../services/auth.service.js';
import logger from '../services/logger.js';
import prisma from "../utils/prisma.js";
import { createAccessToken, createRefreshToken } from "../utils/jwt.js";
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
    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    try {
      await prisma.refreshToken.deleteMany({
        where: {
          tokenHash: hashedToken,
        },
      });
    } catch (err) {
      console.error(
        "Failed to delete refresh token from database during logout:",
        err
      );

      return res.status(500).json({
        success: false,
        msg: "Failed to log out. Please try again.",
      });
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
export async function refresh(req: Request, res: Response, next: NextFunction) {
  const requestId = crypto.randomUUID();

  try {
    logger.info(`[REFRESH ${requestId}] ===== START =====`);

    const refreshToken = req.cookies?.refreshToken;

    logger.info(`[REFRESH ${requestId}] Cookie exists: ${!!refreshToken}`);
    logger.info(
      `[REFRESH ${requestId}] Cookie names: ${Object.keys(req.cookies || {}).join(", ")}`
    );

    if (!refreshToken) {
      logger.warn(`[REFRESH ${requestId}] No refresh token cookie`);
      return res.status(401).json({
        success: false,
        msg: "No refresh token provided."
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    logger.info(
      `[REFRESH ${requestId}] Incoming refresh hash: ${hashedToken}`
    );

    const dbToken = await prisma.refreshToken.findFirst({
      where: {
        tokenHash: hashedToken,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: true,
      },
    });

    logger.info(
      `[REFRESH ${requestId}] DB token found: ${!!dbToken}`
    );

    if (dbToken) {
      logger.info(
        `[REFRESH ${requestId}] DB token id: ${dbToken.id}`
      );

      logger.info(
        `[REFRESH ${requestId}] DB token hash: ${dbToken.tokenHash}`
      );

      logger.info(
        `[REFRESH ${requestId}] User id: ${dbToken.user?.id}`
      );

      logger.info(
        `[REFRESH ${requestId}] Expires: ${dbToken.expiresAt}`
      );
    }

    if (!dbToken || !dbToken.user) {
      logger.warn(
        `[REFRESH ${requestId}] Invalid refresh token`
      );

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      return res.status(403).json({
        success: false,
        msg: "Invalid or expired refresh token."
      });
    }


    const payload = {
      userId: String(dbToken.user.id),
      username: dbToken.user.username,
    };

    logger.info(
      `[REFRESH ${requestId}] Creating new tokens for user ${payload.userId}`
    );


    const accessToken = createAccessToken(payload);
    const newRefreshToken = createRefreshToken(payload);


    const newHash = crypto
      .createHash("sha256")
      .update(newRefreshToken)
      .digest("hex");


    logger.info(
      `[REFRESH ${requestId}] New refresh hash: ${newHash}`
    );


    await prisma.$transaction(async (tx) => {

      logger.info(
        `[REFRESH ${requestId}] Deleting old token id ${dbToken.id}`
      );

      await tx.refreshToken.delete({
        where: {
          id: dbToken.id,
        },
      });


      logger.info(
        `[REFRESH ${requestId}] Creating new refresh token`
      );

      await tx.refreshToken.create({
        data: {
          userId: dbToken.user.id,
          tokenHash: newHash,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    });


    logger.info(
      `[REFRESH ${requestId}] Setting refresh cookie`
    );

    setRefreshCookie(res, newRefreshToken);


    logger.info(
      `[REFRESH ${requestId}] SUCCESS`
    );

    return res.json({
      success: true,
      accessToken,
      user: {
        id: dbToken.user.id,
        username: dbToken.user.username,
        email: dbToken.user.email,
      },
    });


  } catch (err) {
    logger.error(
      `[REFRESH ${requestId}] ERROR: ${err}`
    );

    next(err);
  }
}