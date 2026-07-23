import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt.js";
import { AppError } from "../utils/AppError.js";

export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const auth = req.headers.authorization;
        const token = auth?.startsWith("Bearer ") ? auth.split(" ")[1] : undefined;

        if (!token) {
            throw new AppError(401, "Authentication required.");
        }

        // Anything verifyAccessToken throws (jwt.TokenExpiredError,
        // jwt.JsonWebTokenError, etc.) is caught below and handed to
        // errorHandler, which already knows how to format those.
        req.user = verifyAccessToken(token);

        next();
    } catch (err) {
        next(err);
    }
}
