import express from "express";
import { authMiddleware } from './../middlewares/authMiddleware';
import {signup, login} from "../controllers/authController.js";

const router = express.Router();

router.post("/signup",signup);
router.post("/login", login);

//Protected route
router.get("/me", authMiddleware, (req,res) =>{
    res.json({user: req.user});
});

export default router;
