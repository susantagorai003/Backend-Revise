const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config({
    path: "./.env",
});

const connectDB = async()=>{
    try{
        const connection = await mongoose.connect(`${process.env.MONGO_URI}`);
        console.log("MongoDB connected successfully");
        console.log(`MongoDB connection host: ${connection.connection.host}`);
        
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}
module.exports = connectDB;