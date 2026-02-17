# Deploy Socket.IO Server for Vercel App

## The Problem

Your Next.js app is deployed on **Vercel** at `https://pole-bridge.vercel.app`, but **Vercel doesn't support WebSocket servers** (serverless platform). This is why you see "Disconnected" or "Polling" mode.

## The Solution

Deploy your Socket.IO server (`server.js`) to a **separate platform** that supports WebSockets, then connect your Vercel app to it.

---

## Quick Deploy to Railway (Recommended - 5 minutes)

### Step 1: Sign Up for Railway

1. Go to [railway.app](https://railway.app)
2. Click "Login" → Sign in with GitHub
3. It's free to start! ($5/month for hobby plan with better limits)

### Step 2: Create New Project

1. Click "**New Project**"
2. Select "**Deploy from GitHub repo**"
3. Choose your **pollbridge** repository
4. Click "**Deploy Now**"

### Step 3: Configure Environment Variables

Railway will detect your project. Now add environment variables:

1. Click on your project
2. Go to "**Variables**" tab
3. Add these variables:

```
MONGO_URL=your_mongodb_connection_string_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=https://your-vercel-app.vercel.app
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
googleSec=your_groq_api_key_here
PORT=3000
```

**Important:** Use your actual values from your `.env` file!

### Step 4: Set Start Command

1. Go to "**Settings**" tab
2. Find "**Start Command**"
3. Set it to: `node server.js`
4. Click "**Save**"

### Step 5: Generate Public URL

1. Go to "**Settings**" tab
2. Scroll to "**Networking**"
3. Click "**Generate Domain**"
4. You'll get a URL like: `pollbridge-production-xxxx.up.railway.app`
5. **Copy this URL!**

### Step 6: Update Vercel Environment Variable

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your **pole-bridge** project
3. Go to "**Settings**" → "**Environment Variables**"
4. Find `NEXT_PUBLIC_SOCKET_URL` (or add it if missing)
5. Set value to your Railway URL: `https://pollbridge-production-xxxx.up.railway.app`
6. Click "**Save**"

### Step 7: Redeploy Vercel

1. Go to "**Deployments**" tab in Vercel
2. Click the **three dots** on your latest deployment
3. Click "**Redeploy**"
4. Wait for deployment to complete

### Step 8: Test It! 🎉

1. Visit your Vercel app: `https://pole-bridge.vercel.app`
2. Check the navbar - it should show 🟢 **Live** (may take 10 seconds on first connection)
3. Create a poll and share it
4. Open in two windows and vote - should update **instantly!**

---

## Alternative: Deploy to Render (Free Tier)

### Step 1: Sign Up

1. Go to [render.com](https://render.com)
2. Sign in with GitHub

### Step 2: Create Web Service

1. Click "**New**" → "**Web Service**"
2. Connect your **pollbridge** repository
3. Configure:
   - **Name**: `pollbridge-socket`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
4. Click "**Advanced**"
5. Add environment variables (same as Railway above)

### Step 3: Deploy

1. Click "**Create Web Service**"
2. Wait for deployment (3-5 minutes)
3. Copy your Render URL: `https://pollbridge-socket.onrender.com`

### Step 4: Update Vercel

Same as Railway Step 6 & 7 above, but use your Render URL.

**Note:** Render free tier spins down after inactivity. First connection may take 30 seconds to wake up.

---

## Verify Connection

After redeploying Vercel:

1. Open your app
2. Open browser DevTools (F12)
3. Go to Console tab
4. Look for:

```
🔌 Setting up real-time updates for poll: ...
🌐 Attempting Socket.IO connection to: https://your-railway-url...
✅ Socket connected, ID: abc123...
```

5. Navbar should show: 🟢 **Live**

---

## Troubleshooting

### Still shows "Polling" or "Disconnected"

**Check 1: Railway/Render is Running**
- Visit `https://your-railway-url.up.railway.app/socket.io/`
- Should return something (not 404)

**Check 2: Vercel Environment Variable**
- Must be: `https://your-railway-url.up.railway.app`
- NOT: `https://pole-bridge.vercel.app` (that won't work!)

**Check 3: Redeploy Vercel**
- Environment variable changes require redeployment

**Check 4: Browser Console**
- Check for CORS errors
- Check for connection errors

### Railway Server Keeps Crashing

Check Railway logs:
- Make sure all environment variables are set
- Make sure `MONGO_URL` is correct
- Make sure start command is `node server.js`

### Connection is Slow

First connection may be slow on free tiers:
- Render free: ~30 seconds (server wakes up)
- Railway free: ~5 seconds

Paid tiers have instant connection.

---

## Cost Summary

| Platform | Free Tier | Paid Tier | Speed |
|----------|-----------|-----------|-------|
| **Railway** | $0 (limited hours) | $5/month | Fast |
| **Render** | Free | $7/month | Slow first connect |
| **Heroku** | No free tier | $7/month | Fast |

**Recommendation:** Railway Hobby Plan ($5/month) for best experience.

---

## How It Works Now

```
User Browser
    ↓
Vercel (Frontend) → https://pole-bridge.vercel.app
    ↓ WebSocket connection
Railway/Render (Socket.IO Server) → https://your-railway-url.up.railway.app
    ↓ Database queries
MongoDB Atlas
```

This setup gives you:
- ✅ Instant real-time updates via Socket.IO
- ✅ No polling needed  
- ✅ Scalable architecture
- ✅ Works perfectly on Vercel

---

## Need Help?

1. Check Railway/Render deployment logs
2. Check Vercel deployment logs
3. Check browser console (F12)
4. Verify environment variables match

Your app will work in polling mode (🟡) until you deploy the Socket.IO server!
