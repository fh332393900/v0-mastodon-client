import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(
  request: NextRequest
) {
  const cookieStore = await cookies()
  cookieStore.delete("mastodon_server")
  cookieStore.delete("mastodon_token")

  return NextResponse.json({ success: true })
}