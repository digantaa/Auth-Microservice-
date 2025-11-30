import crypto from "crypto";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";



// SIGNUP

export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "Email already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        res.json({
            message: "User created successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
            },
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// LOGIN (Access + Refresh Token)

export const login = async (req, res) => {
    try {
        console.log("login req body", req.body);
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid password" });

        const accessToken = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        const refreshToken = jwt.sign(
            { id: user._id },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        user.refreshToken = refreshToken;
        user.refreshTokenExpires =
            Date.now() + 7 * 24 * 60 * 60 * 1000;
        await user.save();

        res.json({
            message: "Login successful",
            accessToken,
            refreshToken,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



export const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken)
            return res.status(400).json({ message: "Refresh token is required" });

        const user = await User.findOne({ refreshToken });

        if (!user)
            return res.status(403).json({ message: "Invalid refresh token" });

        if (user.refreshTokenExpires < Date.now()) {
            return res.status(403).json({ message: "Refresh token expired" });
        }

        jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err) => {
            if (err) return res.status(403).json({ message: "Invalid refresh token" });
        });

        const newAccessToken = jwt.sign(
            {
                id: user._id,
                email: user.email,
                role: user.role,
            },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        return res.json({
            message: "New access token generated",
            accessToken: newAccessToken,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};





export const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const founduser = await User.findOne({ email });
        if (!founduser)
            return res.status(400).json({ message: "Email not found" });

        const resetToken = crypto.randomBytes(32).toString("hex");

        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        founduser.resetPasswordToken = hashedToken;
        founduser.resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 min
        await founduser.save();

        res.json({
            message: "Password reset token generated",
            resetToken,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



// RESET PASSWORD

export const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res
                .status(400)
                .json({ message: "Token and new password are required" });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const founduser = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!founduser) {
            return res
                .status(400)
                .json({ message: "Invalid or expired token" });
        }

        founduser.password = await bcrypt.hash(newPassword, 10);
        founduser.resetPasswordToken = undefined;
        founduser.resetPasswordExpires = undefined;

        await founduser.save();

        res.json({ message: "Password reset was successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



// LOGOUT

export const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken)
            return res.status(400).json({ message: "Refresh token is required" });

        const user = await User.findOne({ refreshToken });

        if (!user)
            return res.status(400).json({ message: "Invalid refresh token" });

        user.refreshToken = undefined;
        user.refreshTokenExpires = undefined;
        await user.save();

        res.json({ message: "Logout successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
