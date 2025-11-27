import mongoose from 'mongoose';

export const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URL);
        console.log("mongo connected successfully");
    }catch(error){
        console.log("mongo connection failed:", error.message);
        process.exit(1)
    }
};

