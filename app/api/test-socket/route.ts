import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { pollId, questionIndex } = await req.json()
  
  if (!pollId || questionIndex === undefined) {
    return NextResponse.json({
      error: 'Missing pollId or questionIndex'
    }, { status: 400 })
  }

  try {
    const io = (global as any).io
    
    if (!io) {
      return NextResponse.json({
        error: 'Socket.IO not initialized',
        status: 'failed'
      }, { status: 500 })
    }

    const roomName = `poll-${pollId}`
    console.log(`🧪 TEST: Emitting vote-update to room ${roomName}`)
    
    const payload = {
      pollId,
      questionIndex,
      optionIndex: 0,
      voterName: 'TEST',
      voterEmail: 'test@example.com',
      votedAt: new Date().toISOString(),
      isTest: true
    }

    io.to(roomName).emit('vote-update', payload)

    const roomSize = io.sockets.adapter.rooms.get(roomName)?.size || 0
    
    return NextResponse.json({
      status: 'success',
      message: 'Test event emitted',
      roomName,
      clinetsInRoom: roomSize,
      payload
    })
  } catch (err: any) {
    console.error('❌ Error in test endpoint:', err)
    return NextResponse.json({
      error: err.message,
      status: 'failed'
    }, { status: 500 })
  }
}
