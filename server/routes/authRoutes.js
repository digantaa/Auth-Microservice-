import express from "express";
import { authMiddleware } from './../middlewares/authMiddleware.js';
import {signup, login} from "../controllers/authController.js";
import { forgetPassword, resetPassword } from './../controllers/authController.js';

const router = express.Router();

router.post("/signup",signup);
router.post("/login", login);
router.post("/forgetpassword", forgetPassword);
router.post("/resetpassword",resetPassword);

//Protected route
router.get("/me", authMiddleware, (req,res) =>{
    res.json({user: req.user});
});

export default router;
