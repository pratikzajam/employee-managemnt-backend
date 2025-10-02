import mongoose from 'mongoose';

let connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        process.exit(1);
    }


}

export default connectDb

