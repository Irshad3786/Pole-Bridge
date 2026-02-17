# Real-Time Voting Setup Guide

## Overview

Poll-Bridge supports real-time voting updates using two methods:
1. **Socket.IO** - True real-time updates with WebSockets (best for dedicated servers)
2. **HTTP Polling** - Automatic fallback that works on serverless platforms like Vercel

## How It Works

The app automatically detects the best method:
- ✅ If `NEXT_PUBLIC_SOCKET_URL` is set → Uses Socket.IO for instant updates
- ✅ If not set or Socket.IO fails → Falls back to HTTP polling (3-second refresh)

You'll see the connection status in the poll page navbar:
- 🟢 **Live** - Real-time Socket.IO connected
- 🟡 **Polling** - Using HTTP polling fallback

---

## Option 1: HTTP Polling (Easiest - No Setup Required)

**Best for:** Vercel deployment, quick setup, low traffic

**Pros:**
- ✅ Works on Vercel without any configuration
- ✅ No additional servers needed
- ✅ No extra cost

**Cons:**
- ⚠️ 3-second delay for updates (not instant)
- ⚠️ More API requests (but fine for most use cases)

**Setup:**
1. Leave `NEXT_PUBLIC_SOCKET_URL` empty in your environment variables
2. Deploy to Vercel as normal
3. Done! Polling will automatically work

---

## Option 2: Socket.IO with External Server (Real-time)

**Best for:** Production apps, instant updates, better user experience

**Pros:**
- ✅ Instant real-time updates
- ✅ More efficient (fewer requests)
- ✅ Better user experience

**Cons:**
- ⚠️ Requires separate server deployment
- ⚠️ Small additional cost (~$5/month on Railway)

### Step 1: Deploy Socket.IO Server

You need to deploy `server.js` to a platform that supports WebSockets:

#### Option A: Railway (Recommended)

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your Poll-Bridge repository
5. Add these environment variables in Railway:
   ```
   MONGODB_URI=your_mongodb_connection_string
   PORT=3000
   ```
6. In Railway Settings:
   - Set Start Command: `node server.js`
   - Generate Domain (e.g., `pollbridge-socket.up.railway.app`)
7. Deploy! 🚀

#### Option B: Render

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect your GitHub repo
4. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
   - **Environment:** Add `MONGODB_URI`
5. Create Web Service
6. Note your service URL (e.g., `pollbridge-socket.onrender.com`)

#### Option C: Heroku

1. Install Heroku CLI
2. Run:
   ```bash
   heroku create pollbridge-socket
   heroku config:set MONGODB_URI=your_mongodb_uri
   git push heroku main
   ```
3. Note your app URL

### Step 2: Configure Environment Variables

#### For Local Development with Socket.IO:

Update `.env.local`:
```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

Run the custom server:
```bash
npm run dev:socket
```

#### For Vercel Deployment with Socket.IO:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project → Settings → Environment Variables
3. Add:
   ```
   NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.railway.app
   ```
   *(Replace with your Railway/Render/Heroku URL)*
4. Redeploy your app

### Step 3: Verify Connection

1. Open your poll page
2. Check the navbar for the connection indicator:
   - 🟢 **Live** = Socket.IO working!
   - 🟡 **Polling** = Fallback mode (check URL configuration)
3. Check browser console for connection logs

---

## Troubleshooting

### Socket.IO not connecting:

1. **Check the URL** - Make sure `NEXT_PUBLIC_SOCKET_URL` in Vercel matches your server URL
2. **Check server logs** - Look for connection logs on Railway/Render
3. **Check CORS** - Server.js allows all origins by default
4. **Verify server is running** - Visit `https://your-socket-server.railway.app/socket.io/` (should return "0" or "1")

### Still showing "Polling":

This is **normal** and **working**! The app uses polling as a fallback, which provides real-time updates with a small delay.

To enable instant updates, set up Socket.IO server (Option 2 above).

### Connection keeps dropping:

- Check your Socket.IO server health (might need to restart)
- Railway free tier may sleep after inactivity (upgrade to Hobby plan for 24/7 uptime)
- App will automatically fall back to polling when socket disconnects

---

## Cost Comparison

| Method | Cost | Update Speed | Setup Time |
|--------|------|--------------|------------|
| HTTP Polling | Free | 3 seconds | 0 minutes |
| Socket.IO (Railway Hobby) | $5/month | Instant | 10 minutes |
| Socket.IO (Render) | Free (with limitations) | Instant | 10 minutes |
| Socket.IO (Heroku) | $7/month | Instant | 15 minutes |

---

## Recommended Setup

**For Development:**
```bash
# Terminal 1 - Run custom server with Socket.IO
npm run dev:socket

# Set in .env.local
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

**For Production (Vercel):**

**Starter/Free:** Use HTTP Polling (leave `NEXT_PUBLIC_SOCKET_URL` empty)

**Professional/Production:** Deploy Socket.IO to Railway + set `NEXT_PUBLIC_SOCKET_URL` in Vercel

---

## Environment Variables Summary

### Required for all deployments:
```env
MONGODB_URI=mongodb+srv://...
NEXTAUTH_URL=https://yourapp.vercel.app
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
GROQ_API_KEY=your_groq_api_key
```

### Optional for real-time Socket.IO:
```env
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.railway.app
```

---

## Testing Real-time Updates

1. Open two browser windows with the same poll
2. Vote in one window
3. Watch the other window update:
   - Socket.IO: Updates **instantly** 🟢
   - Polling: Updates within **3 seconds** 🟡

Both methods work great! Choose based on your needs and budget.

---

## Need Help?

- Check the [Vercel Deployment Guide](./VERCEL_DEPLOYMENT.md)
- Review [Railway Docs](https://docs.railway.app/)
- Review [Render Docs](https://render.com/docs)
- Check server logs for connection issues
- Ensure MongoDB allows connections from your server IP
