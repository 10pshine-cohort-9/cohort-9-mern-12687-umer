import { z, ZodError } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validate = (schema: z.ZodObject<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = schema.parse({
                body: req.body,
                params: req.params,
                query: req.query,
            });

            if (parsed.body !== undefined) {
                req.body = parsed.body;
            }
            if (parsed.params !== undefined) {
                req.params = parsed.params as any;
            }
            if (parsed.query !== undefined) {
                req.query = parsed.query as any;
            }

            return next();
        } catch (err) {
            return next(err);
        }
    };
};