// types/jwt.ts
import type{ JwtPayload } from "jsonwebtoken";

export interface AccessTokenPayload extends JwtPayload {
    userId: string;
    username: string;
}