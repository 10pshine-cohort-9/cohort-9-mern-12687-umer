import { z } from "zod";

export const registerationSchema = z.object({
    body: z.object({
        username: z.string().min(3).max(191),
        email: z.string().email().max(191), 
        // 1. Add .max(72) here
        password: z.string().min(8).max(72, "Password cannot exceed 72 characters")
    })
});

export type RegisterInput = z.infer<typeof registerationSchema>["body"];

export const loginSchema = z.object({
    body: z.object({
        identifier: z.string().min(3).max(191),
        // 2. Add .max(72) here
        password: z.string().min(8).max(72, "Password cannot exceed 72 characters")
    })
});

export type LoginInput = z.infer<typeof loginSchema>["body"];