import type { NextFunction, Request, Response } from 'express';
import {
  registerUser,
  authenticateUser,
  issueTokensForUser,
} from '../services/auth.service.js';
import logger from '../services/logger.js';

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


export function logout(req: Request, res: Response) {
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