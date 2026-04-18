"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ExternalLink, Link2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { LoadingSkeleton } from "@/components/mastodon/infinite-scroller"
import { cn } from "@/lib/utils"
import { useExploreNewsCache } from "@/hooks/mastodon/useExploreNewsCache"
import type { ExploreTrendingLink } from "@/hooks/mastodon/useExploreNewsCache"

export default function ExploreNewsPage() {
  const { links, query, isReady } = useExploreNewsCache()
  const { isLoading } = query

  const title = useMemo(() => "Trending Links", [])

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
          {links.length} links
        </Badge>
      </div>

      {links.length === 0 ? (
        <div className="rounded-3xl border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
          暂无热门链接。
        </div>
      ) : (
        <div className="space-y-3">
          {links.map((item: ExploreTrendingLink) => (
            <div key={item.url} className="rounded-3xl border border-border/70 bg-card/90 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                    <div className="font-medium truncate">{item.title || item.url}</div>
                  </div>
                  {item.description ? (
                    <div className="mt-2 text-sm text-muted-foreground line-clamp-2">{item.description}</div>
                  ) : null}
                  {item.authorName ? (
                    <div className="mt-2 text-xs text-muted-foreground">by {item.authorName}</div>
                  ) : null}
                </div>

                <Link
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "shrink-0 inline-flex items-center gap-2 rounded-full border border-border/60 px-3 py-2 text-xs text-muted-foreground hover:text-foreground",
                  )}
                >
                  <ExternalLink className="h-4 w-4" />
                  打开
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
