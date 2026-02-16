const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')
const { Server } = require('socket.io')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

console.log('🚀 Starting pollbridge server...')
console.log('📍 Environment:', dev ? 'development' : 'production')
console.log('🔗 URL: http://' + hostname + ':' + port)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('❌ Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  const io = new Server(httpServer, {
    path: '/socket.io/',
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  })

  io.on('connection', (socket) => {
    console.log('✅ Client connected:', socket.id)
    console.log('📊 Total connected clients:', io.engine.clientsCount)

    socket.on('join-poll', (pollId) => {
      socket.join(`poll-${pollId}`)
      const roomSize = io.sockets.adapter.rooms.get(`poll-${pollId}`)?.size || 0
      console.log(`✅ Socket ${socket.id} joined poll-${pollId}`)
      console.log(`👥 Clients in poll-${pollId}: ${roomSize}`)
    })

    socket.on('leave-poll', (pollId) => {
      socket.leave(`poll-${pollId}`)
      const roomSize = io.sockets.adapter.rooms.get(`poll-${pollId}`)?.size || 0
      console.log(`👋 Socket ${socket.id} left poll-${pollId}`)
      console.log(`👥 Clients remaining in poll-${pollId}: ${roomSize}`)
    })

    socket.on('vote-update', (data) => {
      console.log('🗳️ Vote update event received on server from:', socket.id)
      console.log('📦 Vote data:', data)
    })

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id)
      console.log('📊 Remaining connected clients:', io.engine.clientsCount)
    })
  })

  // Make io accessible globally
  global.io = io
  console.log('✅ Socket.IO attached to global')

  httpServer
    .once('error', (err) => {
      console.error('❌ Server error:', err)
      process.exit(1)
    })
    .listen(port, () => {
      console.log(`✅ Ready on http://${hostname}:${port}`)
      console.log(`✅ Socket.IO server ready on /socket.io/`)
    })
})
