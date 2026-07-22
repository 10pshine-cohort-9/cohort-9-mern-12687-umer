

import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import logger from "../services/logger.js";
import jwt from "jsonwebtoken"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/client";

export function errorHandler(
    err: unknown,
    req: Request,
    res: Response,
    next: NextFunction
) {
    logger.error(err);
    // Custom application errors
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            success: false,
            error: {
                message: err.message,
            },
        });
    }

    // Zod validation
    if (err instanceof ZodError) {
        return res.status(400).json({
            success: false,
            error: {
                message: "Validation failed",
                issues: err.issues,
            },
        });
    }

    // Prisma unique constraint
    if (
        err instanceof PrismaClientKnownRequestError &&
        err.code === "P2002"
    ) {
        return res.status(409).json({
            success: false,
            error: {
                message: "Resource already exists.",
            },
        });
    }

    // JWT
    if (err instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
            success: false,
            error: {
                message: "Token expired.",
            },
        });
    }

    if (err instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
            success: false,
            error: {
                message: "Invalid token.",
            },
        });
    }

    // Unknown error
    logger.error(err);

    return res.status(500).json({
        success: false,
        error: {
            message: "Internal server error.",
        },
    });
}