"use client"

import { TimelineFeed } from "@/components/timeline/timeline-feed"

export default function TimelinePage() {
  return (
    <div className="space-y-6 px-4 py-6">
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold">Public Timeline</h1>
        <p className="text-muted-foreground">Discover what's happening across the fediverse</p>
      </div>

      <TimelineFeed />
    </div>
  )
}
