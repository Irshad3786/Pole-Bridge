# Socket.IO Quick Start Guide

## Get Real-time Updates Working in 2 Minutes

### For Local Development

1. **Make sure your `.env` file has Socket.IO URL:**

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

2. **Start the Socket.IO server:**

```bash
npm run dev:socket
```

3. **Open your app:**

Visit `http://localhost:3000`

4. **Test real-time updates:**

- Create a poll
- Copy the poll link
- Open it in two browser windows
- Vote in one window
- Watch the other window update **instantly!** 🎉

### Connection Status

Look at the top-right of your navbar:

| Indicator | Status |
|-----------|--------|
| 🟢 **Live** | Socket.IO connected - Real-time working! |
| 🔴 **Disconnected** | Socket.IO not connected - Check server |

### For Production (Vercel)

Since Vercel doesn't support WebSocket servers, you need to deploy the Socket.IO server separately:

#### Option 1: Railway (Recommended - $5/month)

1. **Go to [railway.app](https://railway.app)**
2. **Create new project from GitHub**
3. **Add environment variables:**
   ```
   MONGO_URL=your_mongodb_uri
   PORT=3000
   ```
4. **Set start command:** `node server.js`
5. **Get your Railway domain** (e.g., `yourapp.railway.app`)
6. **Update Vercel environment variable:**
   ```
   NEXT_PUBLIC_SOCKET_URL=https://yourapp.railway.app
   ```
7. **Redeploy Vercel**

#### Option 2: Render (Free with limitations)

1. **Go to [render.com](https://render.com)**
2. **New → Web Service**
3. **Connect GitHub repo**
4. **Settings:**
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Environment: Add `MONGO_URL`
5. **Get your Render URL**
6. **Update Vercel:**
   ```
   NEXT_PUBLIC_SOCKET_URL=https://yourapp.onrender.com
   ```

### Troubleshooting

#### ❌ Shows "Disconnected"

**Check:**
1. Is `npm run dev:socket` running?
2. Is `NEXT_PUBLIC_SOCKET_URL` set correctly?
3. Check browser console for errors (F12)
4. Verify server.js is running on port 3000

**Common Issues:**

**Port already in use:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

**Socket not connecting:**
```bash
# Check if server is running
curl http://localhost:3000/socket.io/
# Should return something (not 404)
```

#### ✅ Shows "Live" but no updates

1. Check browser console for vote-update events
2. Verify both windows are viewing the same poll
3. Make sure you're logged in
4. Check server.js console for emit logs

### How It Works

1. **You vote** → Sends POST to `/api/vote`
2. **API saves vote** → Emits `vote-update` event via Socket.IO
3. **Server broadcasts** → Sends event to all clients in that poll room
4. **Other clients receive** → Automatically fetch and update the poll
5. **You see update** → Instantly, no refresh needed!

### Developer Console Logs

When working correctly, you should see:

```
🔌 Setting up Socket.IO for poll: 61a3f5b2...
🌐 Socket URL: http://localhost:3000
✅ Socket connected, ID: abc123...
📋 Joined poll room: poll-61a3f5b2...
🗳️ Vote-update event received: {pollId: "...", ...}
🔄 Poll refreshed from socket event
```

### Testing Checklist

- [ ] `npm run dev:socket` is running
- [ ] `.env` has `NEXT_PUBLIC_SOCKET_URL=http://localhost:3000`
- [ ] Browser shows 🟢 "Live" indicator
- [ ] Console shows Socket connected
- [ ] Two browser windows open with same poll
- [ ] Voting in one window updates the other instantly

---

**Need help?** Check the server.js console and browser console (F12) for error messages!
