# Testing Real-time Updates Guide

## How It Works

Your Poll-Bridge app now has **automatic real-time updates** with two methods:

### 🟢 Socket.IO Mode (Instant)
- When `NEXT_PUBLIC_SOCKET_URL` is set
- Updates appear **instantly** when anyone votes
- Uses WebSocket connections
- Shows "Live" indicator in navbar

### 🟡 HTTP Polling Mode (3-5 second delay)
- Automatically used when Socket.IO is unavailable
- Updates every 3 seconds (poll page) or 5 seconds (dashboard)
- No configuration needed
- Shows "Polling" indicator in navbar

## Testing Real-time Updates

### Test 1: Poll Page Live Updates

1. **Create a poll** in your dashboard
2. **Copy the poll link**
3. **Open TWO browser windows:**
   - Window A: Open the poll link
   - Window B: Open the same poll link (or use incognito mode)
4. **Login in both windows** (can be different accounts or same account in different browsers)
5. **Vote in Window A**
6. **Watch Window B** - It should update automatically!

**Expected Result:**
- If Socket.IO is working: Updates **instantly** (< 1 second)
- If using polling: Updates within **3 seconds**

### Test 2: Dashboard Live Updates

1. **Open dashboard** in one browser window
2. **Copy a poll link** from your dashboard
3. **Open the poll link** in another window/incognito
4. **Vote on the poll** in the second window
5. **Watch the dashboard** - Vote counts should update automatically!

**Expected Result:**
- If Socket.IO is working: Updates **instantly**
- If using polling: Updates within **5 seconds**

### Test 3: Multiple Users

1. **Share poll link** with a friend (or use different devices)
2. **Both open the poll** at the same time
3. **Take turns voting** on different questions
4. **Watch each other's screens** - You should see votes appear in real-time!

## Visual Indicators

### Connection Status (Top Right of Navbar)

| Indicator | Meaning | Update Speed |
|-----------|---------|--------------|
| 🟢 **Live** | Socket.IO connected | Instant |
| 🟡 **Polling** | Using HTTP fallback | 3-5 seconds |

### Where to Look

**Poll Page (`/poll/[id]`):**
- Connection indicator in navbar
- Vote counts update automatically
- Progress bars animate when votes come in
- Voter names appear in real-time

**Dashboard (`/dashboard`):**
- Connection indicator in navbar
- "My Polls" section shows updated vote counts
- Progress bars reflect latest votes
- Total vote counts update automatically

## Debugging Real-time Updates

### Check Browser Console

Open browser Developer Tools (F12) and check the Console tab:

**Socket.IO Mode:**
```
🔌 Setting up Socket.IO for poll: 61a3f...
✅ Socket connected, ID: abc123...
📋 Joined poll room: poll-61a3f...
🗳️ Vote-update event received: {...}
```

**Polling Mode:**
```
⚠️ No NEXT_PUBLIC_SOCKET_URL found, using HTTP polling
🔄 Starting HTTP polling for real-time updates
```

**Vote Received:**
```
🗳️ Dashboard received vote-update: {pollId: "...", ...}
🔄 Poll refreshed from socket event
```

### Common Issues

#### "Polling" instead of "Live"

**Causes:**
1. `NEXT_PUBLIC_SOCKET_URL` is not set
2. Socket.IO server is not running
3. Socket.IO server URL is incorrect
4. Socket.IO server is not accessible

**Solution:**
- Check environment variables in Vercel
- Verify Socket.IO server is deployed and running
- Test server URL: `https://your-socket-server.com/socket.io/` (should return data)
- Polling mode still works fine! Upgrade to Socket.IO for instant updates

#### Updates Not Showing

**If using Socket.IO:**
1. Check console for connection errors
2. Verify you're in the same poll room
3. Make sure vote API is emitting events

**If using Polling:**
1. Wait 3-5 seconds for update
2. Check network tab for fetch requests
3. Verify API is returning updated data

#### Slow Updates

**If Socket.IO shows "Live" but updates are slow:**
- Check network latency
- Verify server is not overloaded
- Server might be sleeping (free tier platforms)

**If using Polling:**
- This is normal! Updates every 3-5 seconds
- Deploy Socket.IO server for instant updates

## Performance Notes

### HTTP Polling
- **API Requests:** 1 request every 3-5 seconds per active user
- **Bandwidth:** Minimal (only JSON data)
- **Limitation:** May hit rate limits with many concurrent users
- **Best for:** Low to medium traffic, free deployments

### Socket.IO
- **API Requests:** Only on initial load
- **Bandwidth:** Very low (only vote events sent)
- **Limitation:** Requires dedicated server
- **Best for:** High traffic, instant updates needed

## Local Development Testing

### With Socket.IO (Recommended)

```bash
# Terminal 1 - Start Socket.IO server
npm run dev:socket

# In .env.local
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

### Without Socket.IO (Polling Only)

```bash
# Terminal 1 - Normal Next.js dev
npm run dev

# In .env.local
# NEXT_PUBLIC_SOCKET_URL=  (leave empty or comment out)
```

## Production Deployment Testing

### On Vercel (with HTTP Polling)

1. Deploy to Vercel
2. Don't set `NEXT_PUBLIC_SOCKET_URL`
3. Test as described above
4. Should see "Polling" indicator
5. Updates within 3-5 seconds

### On Vercel (with Socket.IO)

1. Deploy Socket.IO server to Railway/Render
2. Set `NEXT_PUBLIC_SOCKET_URL` in Vercel environment variables
3. Redeploy Vercel app
4. Test as described above
5. Should see "Live" indicator
6. Updates instantly

## Expected Behavior Summary

| Scenario | Window A Action | Window B Result | Time |
|----------|-----------------|-----------------|------|
| Socket.IO | Vote submitted | Vote appears | < 1s |
| Polling | Vote submitted | Vote appears | 3-5s |
| Dashboard + Socket.IO | Someone votes | Vote count updates | < 1s |
| Dashboard + Polling | Someone votes | Vote count updates | ~5s |

## Next Steps

1. ✅ Test on local development
2. ✅ Deploy to Vercel (polling works automatically)
3. ✅ Share poll links and watch real-time updates!
4. 🚀 (Optional) Deploy Socket.IO for instant updates

For Socket.IO setup, see [REALTIME_SETUP.md](./REALTIME_SETUP.md)

---

**Questions?** Check the browser console for detailed logs!
