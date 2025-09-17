import { type NextRequest, NextResponse } from "next/server"
import { createRestAPIClient } from "masto"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const serverUrl = searchParams.get("server")

    if (!serverUrl) {
      return NextResponse.json({ error: "Server URL is required" }, { status: 400 })
    }
    console.log(serverUrl, 'serverUrl')
    console.log(createRestAPIClient, 'createRestAPIClient')
    const client = createRestAPIClient({ url: serverUrl, accessToken: process.env.MASTODON_TOKEN })
   
    console.log(client.v1, '--')
    const app = await client.v1.apps.create({
      clientName: "MastoClient",
      redirectUris: `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/auth/mastodon/callback`,
      scopes: "read write follow push",
      website: process.env.NEXTAUTH_URL || "http://localhost:3000",
    })
    console.log(app, 'app')

    const authUrl = `${serverUrl}/oauth/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${encodeURIComponent(app.redirectUri)}&response_type=code&scope=read+write+follow+push&serverUrl=${serverUrl}&clientSecret=${process.env.CLIIENT_SECRET}`

    return NextResponse.redirect(authUrl)
  } catch (error) {
    console.error("Mastodon OAuth error:", error)
    return NextResponse.json({ error: "Failed to initialize OAuth" }, { status: 500 })
  }
}
