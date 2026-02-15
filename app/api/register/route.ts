import { NextRequest , NextResponse } from "next/server";
import bycrypt from "bcryptjs"
import { connectDB } from "@/lib/mongoConn";
import { User } from "@/models/user";


export async function POST ( req: NextRequest ){
    try {
        
        const { name, email, password } = await req.json()

        if(!name || !email || !password){
            return NextResponse.json({error:"fields missing"},{status:400})
        }

        await connectDB();

        const existUser = await User.findOne({email})
        if(existUser){
            return NextResponse.json(
                { error: "User already exists" },
                { status: 409 }
            );
        }

        const hashPassword = await bycrypt.hash(password,10)

        await User.create({
            name,
            email,
            password:hashPassword,
            provider: "credentials",
        })

        console.log("User registered:", { name, email })

        return NextResponse.json(
            { message: "User registered successfully" },
            { status: 201 }
        )
        
    } catch (err: any) {
        return NextResponse.json(
            { error: "Internal Server Error", details: err?.message ?? "Unknown error" },
            { status: 500 }
        )
    }
}
