import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  const io = (global as any).io
  
  return NextResponse.json({
    status: 'ok',
    socketio_initialized: !!io,
    timestamp: new Date().toISOString()
  })
}
