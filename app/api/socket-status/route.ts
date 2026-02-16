import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const io = (global as any).io
  const socketStatus = io ? 'initialized' : 'NOT_INITIALIZED'
  
  console.log('📊 Health check - Socket.IO status:', socketStatus)
  
  if (io) {
    const rooms = io.sockets.adapter.rooms ? Object.keys(io.sockets.adapter.rooms) : []
    const clientCount = io.engine.clientsCount || 0
    
    console.log('📋 Active rooms:', rooms)
    console.log('👥 Connected clients:', clientCount)
    
    return NextResponse.json({
      status: 'ok',
      socketio: {
        initialized: true,
        activeRooms: rooms,
        connectedClients: clientCount,
        timestamp: new Date().toISOString()
      }
    })
  }
  
  return NextResponse.json({
    status: 'error',
    socketio: {
      initialized: false,
      error: 'Socket.IO not initialized'
    }
  }, { status: 500 })
}
