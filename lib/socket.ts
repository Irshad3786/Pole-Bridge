import { Server as NetServer } from 'http'
import { NextApiRequest } from 'next'
import { Server as SocketIOServer } from 'socket.io'

export type NextApiResponseServerIO = {
  socket: {
    server: NetServer & {
      io?: SocketIOServer
    }
  }
}

let io: SocketIOServer | undefined

export const initSocketIO = (server: NetServer) => {
  if (!io) {
    io = new SocketIOServer(server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    })

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      socket.on('join-poll', (pollId: string) => {
        socket.join(`poll-${pollId}`)
        console.log(`Socket ${socket.id} joined poll-${pollId}`)
      })

      socket.on('leave-poll', (pollId: string) => {
        socket.leave(`poll-${pollId}`)
        console.log(`Socket ${socket.id} left poll-${pollId}`)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
  }

  return io
}

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized')
  }
  return io
}
