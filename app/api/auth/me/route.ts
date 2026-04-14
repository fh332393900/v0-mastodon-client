import { NextResponse } from "next/server"
import { getMastodonClient } from "@/app/api/_lib/mastodon"

export async function GET() {
  try {
    const client = await getMastodonClient()

    if (!client) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const account = await client.v1.accounts.verifyCredentials()
    return NextResponse.json(account)
  } catch (error) {
    console.error("Verify credentials error:", error)
    return NextResponse.json({ error: "Failed to fetch current user" }, { status: 500 })
  }
}
