import express from "express";
import { verifyEmail } from "./controller";
import { verifyTokenMiddleware } from "./middlewares/middleware";
import {
  userSignup,
  userLogin,
} from "./controller";
import {
  validateUserR,
  validateUserRLogin,
} from "./user.validation";
import { verifyOTP } from "./middlewares/middleware";

const userRoutes = express.Router();

userRoutes.post("/signup", validateUserR, userSignup);
userRoutes.post("/login", validateUserRLogin, userLogin);
userRoutes.get("/verify-email", verifyTokenMiddleware, verifyEmail);
userRoutes.post("/verify-otp", verifyOTP);




export default userRoutes;