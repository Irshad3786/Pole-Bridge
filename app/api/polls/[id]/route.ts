import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongoConn"
import { Poll } from "@/models/poll"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Await params if it's a Promise (Next.js 15+)
    const resolvedParams = await Promise.resolve(params)
    const pollId = resolvedParams.id

    if (!pollId) {
      return NextResponse.json(
        { error: "Poll ID is required" },
        { status: 400 }
      )
    }

    await connectDB()

    const poll = await Poll.findById(pollId)

    if (!poll) {
      return NextResponse.json(
        { error: "Poll not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { poll },
      { status: 200 }
    )

  } catch (err: any) {
    console.error("Error fetching poll:", err)
    
    // Handle invalid MongoDB ObjectId
    if (err.name === 'CastError') {
      return NextResponse.json(
        { error: "Invalid poll ID format" },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal Server Error", details: err?.message ?? "Unknown error" },
      { status: 500 }
    )
  }
}
