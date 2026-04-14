"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function TimelinePage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/mastodon.social/timeline")
  }, [router])

  return null
}
