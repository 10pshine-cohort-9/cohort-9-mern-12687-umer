import { z, ZodError } from "zod";
import type { Request, Response, NextFunction } from "express";

export const validate =
    (schema: z.ZodObject<any, any>) => {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                    schema.parse({
                    body: req.body,
                    params: req.params,
                    query: req.query,
                });

                return next();
            } catch (err) {
                return next(err);
            }
        };

  }
