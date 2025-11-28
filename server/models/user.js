import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },

    email:{
        type: String,
        required: true,
        unique: true
    },

    password:{
        type: String,
        required: true,
    },
    
    role: {
        type: String,
        default: "user"
    },

    //for forget password
    resetPasswordToken: String,
    resetPasswordExpires: Date,

    //refresh token
    refreshToken: {
        type: String,
    },

    refreshTokenExpires: {
        type: Date,
    }
    
},{ timestamps: true });

export default mongoose.model("User", userSchema)