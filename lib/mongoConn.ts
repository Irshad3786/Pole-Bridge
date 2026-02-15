import mongoose  from "mongoose"


const mongoUrl = process.env.MONGO_URL as string



export const connectDB = async()=>{
    if(mongoose.connection.readyState >= 1) return;
    if(!mongoUrl || mongoUrl.trim() === ""){
        throw new Error("MONGO_URL is missing or invalid")
    }
    await mongoose.connect(mongoUrl)
}

