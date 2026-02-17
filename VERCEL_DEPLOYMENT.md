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

**Options**:
1. **Remove Socket.IO** (Recommended for Vercel)
   - Delete Socket.IO logic from your app
   - Use HTTP polling for real-time updates

2. **Use External Service** (Recommended for real-time features)
   - **Pusher**: pusher.com
   - **Socket.io Cloud**: socket.io/cloud
   - **Supabase Realtime**: supabase.com
   - **Firebase**: firebase.google.com

3. **Keep local Socket.IO** (Development only)
   - Works fine locally with `npm run dev`
   - Won't work on Vercel production

### 4. Environment Variables in Vercel
1. Go to https://vercel.com/dashboard/projects
2. Select your project
3. Go to Settings → Environment Variables
4. Add:
   - `NEXTAUTH_URL`: Your Vercel domain (https://yourapp.vercel.app)
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `MONGODB_URI`: Your MongoDB connection string
   - `GROQ_API_KEY`: Your GROQ API key

### 5. Deploy Steps
1. Push code to GitHub
2. Sign in to Vercel with GitHub
3. Import your project
4. Vercel auto-detects Next.js configuration
5. Add environment variables
6. Click Deploy

### 6. Recommended: Replace Socket.IO with HTTP Polling

For real-time poll updates without Socket.IO:
```typescript
// Use React Query or SWR with polling
import { useQuery } from '@tanstack/react-query';

export function usePollUpdates(pollId: string) {
  return useQuery({
    queryKey: ['poll', pollId],
    queryFn: () => fetch(`/api/polls/${pollId}`).then(r => r.json()),
    refetchInterval: 2000, // Poll every 2 seconds
  });
}
```

## Verification Checklist
- [ ] `package.json` scripts updated
- [ ] Environment variables added to Vercel
- [ ] No custom server.js references
- [ ] Database (MongoDB) accessible from Vercel IP
- [ ] All API routes in `/app/api`
- [ ] Socket.IO either removed or using external service
- [ ] Delete `server.js` if not needed locally

## Support
For issues or questions, refer to:
- Vercel Docs: https://vercel.com/docs/frameworks/nextjs
- Next.js Docs: https://nextjs.org/docs
- Socket.io Cloud: https://socket.io/cloud
