import { NextRequest, NextResponse } from 'next/server'
import { Server as SocketIOServer } from 'socket.io'

export const dynamic = 'force-dynamic'

let io: SocketIOServer | undefined

export async function GET(req: NextRequest) {
  if (!io) {
    // Initialize Socket.IO server
    const httpServer = (global as any).httpServer
    
    if (!httpServer) {
      return NextResponse.json(
        { message: 'Socket.IO server initializing...' },
        { status: 200 }
      )
    }

    io = new SocketIOServer(httpServer, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    })

    io.on('connection', (socket) => {
      console.log('✅ Client connected:', socket.id)

      socket.on('join-poll', (pollId: string) => {
        socket.join(`poll-${pollId}`)
        console.log(`📊 Socket ${socket.id} joined poll-${pollId}`)
      })

      socket.on('leave-poll', (pollId: string) => {
        socket.leave(`poll-${pollId}`)
        console.log(`👋 Socket ${socket.id} left poll-${pollId}`)
      })

      socket.on('disconnect', () => {
        console.log('❌ Client disconnected:', socket.id)
      })
    })

    // Store io instance globally
    ;(global as any).io = io
  }

  return NextResponse.json({ message: 'Socket.IO initialized' }, { status: 200 })
}
