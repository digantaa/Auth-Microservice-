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
            {expiresin: '1h'}
        );

        res.json({
            message: "Login successful",
            token
        });

    }catch(error){
        res.status(500).json({error: error.message});
    }
}