import mongoose,{Schema,models}from "mongoose"


interface UserI {
    name:string
    email:string
    provider:"credentials" | "google"
    password?:string | null
    googleId?:string | null
}

const userSchema = new Schema<UserI>({
    name:{type:String, required:true},
    email:{type:String, required:true},
    provider: { type: String, enum: ["credentials", "google"], required: true },
    password:{
        type:String,
        required:function(this: UserI){ return this.provider === "credentials" },
        default:null
    },
    googleId: {
        type: String,
        required:function(this: UserI){ return this.provider === "google" },
        default: null
    }
    },
    {
        timestamps:true
    }
)

export const User = models.User || mongoose.model("User" , userSchema)