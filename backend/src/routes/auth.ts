import {Router} from "express";
import { validate } from "../middleware/validate.js";
import {register, login, logout} from "../controllers/authController.js"
import { registerationSchema, loginSchema } from "../validation/auth.schema.js";



const router = Router();

router.post("/register",
    validate(registerationSchema),
    register
);

router.post("/login",
    validate(loginSchema),
    login
);

router.post("/logout",
    logout
);

export default router;