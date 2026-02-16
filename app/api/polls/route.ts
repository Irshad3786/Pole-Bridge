import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongoConn"
import { Poll } from "@/models/poll"

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please login." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { title, description, questions } = body

    if (!title || !description || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, questions" },
        { status: 400 }
      )
    }

    if (questions.length === 0) {
      return NextResponse.json(
        { error: "At least one question is required" },
        { status: 400 }
      )
    }

    // Validate questions structure
    for (const q of questions) {
      if (!q.question || !q.options || !Array.isArray(q.options)) {
        return NextResponse.json(
          { error: "Each question must have a question text and options array" },
          { status: 400 }
        )
      }
      if (q.options.length < 2) {
        return NextResponse.json(
          { error: "Each question must have at least 2 options" },
          { status: 400 }
        )
      }
    }

    await connectDB()

    // Find user by email
    const { User } = await import("@/models/user")
    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Create poll with votes array initialized as empty for each question
    const pollData = {
      title,
      description,
      questions: questions.map((q: any) => ({
        question: q.question,
        options: q.options,
        votes: [] // Initialize empty votes array
      })),
      createdBy: user._id
    }

    const poll = await Poll.create(pollData)

    return NextResponse.json(
      { 
        message: "Poll created successfully", 
        pollId: poll._id,
        poll 
      },
      { status: 201 }
    )

  } catch (err: any) {
    console.error("Error creating poll:", err)
    return NextResponse.json(
      { error: "Internal Server Error", details: err?.message ?? "Unknown error" },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please login." },
        { status: 401 }
      )
    }

    await connectDB()

    // Find user by email
    const { User } = await import("@/models/user")
    const user = await User.findOne({ email: session.user.email })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    // Get all polls created by this user
    const polls = await Poll.find({ createdBy: user._id }).sort({ createdAt: -1 })

    return NextResponse.json(
      { polls },
      { status: 200 }
    )

  } catch (err: any) {
    console.error("Error fetching polls:", err)
    return NextResponse.json(
      { error: "Internal Server Error", details: err?.message ?? "Unknown error" },
      { status: 500 }
    )
  }
}
