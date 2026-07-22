import { z } from "zod";

export const registerationSchema = z.object({
    body: z.object({
        username: z.string().min(3).max(191),
        // Note: z.string().email() is the standard Zod syntax
        email: z.string().email().max(191), 
        password: z.string().min(8)
    })
});

export type RegisterInput = z.infer<typeof registerationSchema>["body"];

export const loginSchema = z.object({
    body: z.object({
        identifier: z.string().min(3).max(191),
        password: z.string().min(8)
    })
});

export type LoginInput = z.infer<typeof loginSchema>["body"];