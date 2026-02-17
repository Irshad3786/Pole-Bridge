# Vercel Deployment Guide

## Changes Made for Vercel

### 1. Removed Custom Server ❌ → Vercel Built-in ✅
- **Old**: Custom HTTP server via `server.js`
- **New**: Vercel's optimized Next.js runtime
- This allows Vercel's serverless infrastructure to manage your app

### 2. Updated Package Scripts
```json
"dev": "next dev"      // Changed from "node server.js"
"start": "next start"  // Changed from "node server.js"
```

### 3. Socket.IO on Vercel ⚠️
**Important**: Vercel uses serverless functions which don't support persistent WebSocket connections with custom servers.

✅ **Your app now uses hybrid real-time updates:**
- Socket.IO for instant updates (when configured)
- HTTP polling as automatic fallback (works on Vercel without setup)

**See [REALTIME_SETUP.md](./REALTIME_SETUP.md) for detailed options:**
1. **HTTP Polling** (No setup) - Updates every 3 seconds
2. **Socket.IO** (Requires external server) - Instant updates

The app automatically detects the best method and shows connection status in the navbar:
- 🟢 **Live** = Socket.IO connected
- 🟡 **Polling** = HTTP polling active

### 4. Environment Variables in Vercel
1. Go to https://vercel.com/dashboard/projects
2. Select your project
3. Go to Settings → Environment Variables
4. Add:
   - `NEXTAUTH_URL`: Your Vercel domain (https://yourapp.vercel.app)
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `MONGODB_URI`: Your MongoDB connection string
   - `GROQ_API_KEY`: Your GROQ API key
   - `NEXT_PUBLIC_SOCKET_URL`: (Optional) Your Socket.IO server URL
     - Leave empty to use HTTP polling
     - Set to external Socket.IO server URL for real-time (e.g., https://your-app.railway.app)

### 5. Deploy Steps
1. Push code to GitHub
2. Sign in to Vercel with GitHub
3. Import your project
4. Vercel auto-detects Next.js configuration
5. Add environment variables
6. Click Deploy

### 6. Real-time Updates Configuration

Your app automatically handles real-time updates:
- ✅ **Works immediately** with HTTP polling (3-second updates)
- ✅ **Upgrade to instant updates** by deploying Socket.IO server

See [REALTIME_SETUP.md](./REALTIME_SETUP.md) for Socket.IO setup guide.

## Verification Checklist
- [ ] `package.json` scripts updated
- [ ] Environment variables added to Vercel
  - [ ] `NEXTAUTH_URL`
  - [ ] `NEXTAUTH_SECRET`
  - [ ] `MONGODB_URI`
  - [ ] `GROQ_API_KEY`
  - [ ] `NEXT_PUBLIC_SOCKET_URL` (optional, for Socket.IO)
- [ ] Database (MongoDB) accessible from Vercel IP
- [ ] All API routes in `/app/api`
- [ ] Real-time updates working (check navbar indicator)
- [ ] `server.js` kept for local development (optional)

## Support
For issues or questions, refer to:
- [Real-time Setup Guide](./REALTIME_SETUP.md) - Configure Socket.IO or polling
- Vercel Docs: https://vercel.com/docs/frameworks/nextjs
- Next.js Docs: https://nextjs.org/docs
