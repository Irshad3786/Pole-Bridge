import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { connectDB } from "@/lib/mongoConn"
import { Poll } from "@/models/poll"
import { User } from "@/models/user"

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession()
    
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please login to vote." },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { pollId, questionIndex, optionIndex } = body

    if (!pollId || questionIndex === undefined || optionIndex === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: pollId, questionIndex, optionIndex" },
        { status: 400 }
      )
    }

    if (typeof questionIndex !== 'number' || typeof optionIndex !== 'number') {
      return NextResponse.json(
        { error: "questionIndex and optionIndex must be numbers" },
        { status: 400 }
      )
    }

    await connectDB()

    // Get user from database
    const user = await User.findOne({ email: session.user.email })
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    const poll = await Poll.findById(pollId)

    if (!poll) {
      return NextResponse.json(
        { error: "Poll not found" },
        { status: 404 }
      )
    }

    if (questionIndex < 0 || questionIndex >= poll.questions.length) {
      return NextResponse.json(
        { error: "Invalid question index" },
        { status: 400 }
      )
    }

    const question = poll.questions[questionIndex]

    if (optionIndex < 0 || optionIndex >= question.options.length) {
      return NextResponse.json(
        { error: "Invalid option index" },
        { status: 400 }
      )
    }

    // Check if user has already voted on this question
    const hasVoted = question.votes.some((vote: any) => 
      vote.voterEmail === user.email || vote.voterId?.toString() === user._id.toString()
    )

    if (hasVoted) {
      return NextResponse.json(
        { error: "You have already voted on this question" },
        { status: 409 }
      )
    }

    // Add the vote
    const vote = {
      optionIndex,
      voterName: user.name,
      voterEmail: user.email,
      voterId: user._id,
      votedAt: new Date()
    }

    poll.questions[questionIndex].votes.push(vote)
    await poll.save()

    // Emit socket event to notify all clients of the new vote
    try {
      const io = (global as any).io
      
      if (!io) {
        console.warn('⚠️ Socket.IO not available - skipping broadcast')
      } else {
        const roomName = `poll-${pollId}`
        const payload = {
          pollId,
          questionIndex,
          optionIndex,
          voterName: user.name,
          voterEmail: user.email,
          votedAt: vote.votedAt
        }
        
        console.log(`🚀 Emitting vote-update to ${roomName}`)
        io.to(roomName).emit('vote-update', payload)
        console.log(`✅ Emitted to ${roomName}`)
      }
    } catch (err) {
      console.error('❌ Socket emit error:', err)
    }

    return NextResponse.json(
      { 
        message: "Vote recorded successfully",
        vote,
        poll 
      },
      { status: 200 }
    )

  } catch (err: any) {
    console.error("Error recording vote:", err)
    return NextResponse.json(
      { error: "Internal Server Error", details: err?.message ?? "Unknown error" },
      { status: 500 }
    )
  }
}
