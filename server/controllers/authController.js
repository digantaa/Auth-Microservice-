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
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email" });

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password" });

        // Create ACCESS TOKEN (15 min)

        const accessToken = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        // create refrence token (7 days)

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        // Save refresh token in DB
        user.refreshToken = refreshToken;
        user.refreshTokenExpires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
        await user.save();

        // Response

        res.json({
            message: "Login successful",
            accessToken,
            refreshToken
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if(!refreshToken) return res.status(400).json({message: "Refresh token is required"});

        //Find user with this refresh token 
        const user = await User.findOne({ refreshToken });

        if(!user) return res.status(403).json({message: "invalid refresh token"});

        //check expiry
        if(user.refreshTokenExpires < Date.now()){
            return res.status(403).json({message: "refresh token expire"})
        }

        //Verify refresh token signature
        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET,(err, decoded) =>{
            if(err){
                return res.status(403).json({ message: "Invalid refresh token"});
            }
        });

        //issue new access token 
        const newAccessToken = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role
            },
            process.env.JWT-SECRET,
            { expiresIn: "15m"}
        );

        return res.json({
            message: "new access token generated ",
            accessToken: newAccessToken
        })

    }catch(err){
        res.status(500).json({error:err.message});
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
