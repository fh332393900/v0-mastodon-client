"use client"

import { useMasto } from "@/components/auth/masto-provider"
import { contentToReactNode } from '@/lib/mastodon/contentToReactNode'

export default function MastodonContent({
  content,
  emojis,
}: {
  content: string
  emojis?: import("masto").mastodon.v1.CustomEmoji[]
}) {
  const { server } = useMasto()

  return (
    <div className="prose max-w-none break-words text-small content-rich">
      {contentToReactNode(content, emojis, server)}
    </div>
  )
}
