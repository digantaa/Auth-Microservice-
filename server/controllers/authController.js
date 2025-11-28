import crypto from "crypto";
import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
    try{
        const {name, email, password} = req.body;
        
        //check if user exists 
        const userExists = await User.findOne({email});
        if(userExists){
            return res.status(400).json({message: "Email already exists. "});
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //create user
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword
        });

        res.json({
            message: "user created successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email:newUser.email
            }
        });

    }catch(error){
        res.status(500).json({error: error.message});
    }
}

export const login = async (req, res) => {
    try{
        const {email, password} = req.body;

        //check user
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({message: "Invalid email"});

        //compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).json({message: "Invalid password"});

        //create token
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {expiresIn: '1h'}
        );

        res.json({
            message: "Login successful",
            token
        });

    }catch(error){
        res.status(500).json({error: error.message});
    }
}

export const forgetPassword = async (req, res) => {
    try{

        const {email} = req.body;

        const founduser = await User.findOne({email});
        if(!founduser) return res.status(400).json({message: "Email not found "})

        //Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");

        //Hash token before saving in DB
        const hashedToken = crypto.createHash("sha256")
            .update(resetToken)
            .digest("hex");
        
        founduser.resetPasswordToken = hashedToken;
        founduser.resetPasswordExpires = Date.now() +10*60*1000; //10 minute

        await founduser.save();

        res.json({
            message:"Password reset token generated",
            resetToken
        })
    }catch(err){
        res.status(500).json({error: err.message});
    }
}

export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: "Token and new password are required" });
        }

        // Hash the received token
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // Find user by hashed token & expiry
        const founduser = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!founduser) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Update password
        founduser.password = await bcrypt.hash(newPassword, 10);

        // Clear the reset fields
        founduser.resetPasswordToken = undefined;
        founduser.resetPasswordExpires = undefined;

        await founduser.save();

        res.json({ message: "Password reset was successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
