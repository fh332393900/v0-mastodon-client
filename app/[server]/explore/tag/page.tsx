"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Hash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { LoadingSkeleton } from "@/components/mastodon/infinite-scroller"
import { cn } from "@/lib/utils"
import { useExploreTagsCache } from "@/hooks/mastodon/useExploreTagsCache"
import type { mastodon } from "masto"

export default function ExploreTagsPage() {
  const { tags, query, isReady } = useExploreTagsCache()
  const { isLoading } = query

  const title = useMemo(() => "Trending Tags", [])

  if (!isReady || isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Badge variant="outline" className="text-accent border-accent/50">
          {tags.length} tags
        </Badge>
      </div>

      {tags.length === 0 ? (
        <div className="rounded-3xl border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
          暂无热门标签。
        </div>
      ) : (
        <div className="divide-y divide-border/60 overflow-hidden rounded-3xl border border-border/70 bg-card/90">
          {tags.map((tag: mastodon.v1.Tag) => (
            <Link
              key={tag.name}
              href={`/tag/${encodeURIComponent(tag.name)}`}
              className={cn("flex items-center justify-between gap-3 p-4 hover:bg-muted/50")}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Hash className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium truncate">#{tag.name}</div>
                  {tag.history?.[0]?.uses ? (
                    <div className="text-xs text-muted-foreground">{tag.history[0].uses} uses</div>
                  ) : null}
                </div>
              </div>
              {tag.history?.[0]?.accounts ? (
                <Badge variant="secondary">{tag.history[0].accounts} accounts</Badge>
              ) : null}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
