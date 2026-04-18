"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LoadingSkeleton } from "@/components/mastodon/infinite-scroller"
import { cn } from "@/lib/utils"
import { useMasto } from "@/components/auth/masto-provider"
import { getAccountProfileHref } from "@/lib/mastodon/account"
import { useExploreSuggestedAccountsCache } from "@/hooks/mastodon/useExploreSuggestedAccountsCache"
import type { mastodon } from "masto"

export default function ExploreSuggestedPage() {
  const { accounts, query, isReady } = useExploreSuggestedAccountsCache()
  const { server } = useMasto()
  const { isLoading } = query

  const title = useMemo(() => "Suggested", [])

  if (!isReady || isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            {title}
          </h2>
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          {title}
        </h2>
        <Badge variant="outline" className="text-accent border-accent/50">
          {accounts.length} accounts
        </Badge>
      </div>

      {accounts.length === 0 ? (
        <div className="rounded-3xl border border-border/70 bg-card/90 p-6 text-sm text-muted-foreground">
          暂无推荐关注。
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((a: mastodon.v1.Account) => {
            const href = server ? getAccountProfileHref(a, server) : undefined
            return (
              <div key={a.id} className="rounded-3xl border border-border/70 bg-card/90 p-4">
                <div className="flex items-center gap-3">
                  {href ? (
                    <Link href={href} className="shrink-0">
                      <Avatar className="ring-2 ring-border/70">
                        <AvatarImage src={a.avatar} alt={a.displayName} />
                        <AvatarFallback>{(a.displayName || a.username).charAt(0)}</AvatarFallback>
                      </Avatar>
                    </Link>
                  ) : (
                    <Avatar className="ring-2 ring-border/70">
                      <AvatarImage src={a.avatar} alt={a.displayName} />
                      <AvatarFallback>{(a.displayName || a.username).charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{a.displayName || a.username}</div>
                    <div className="text-sm text-muted-foreground truncate">@{a.acct}</div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className={cn("shrink-0")}
                    disabled
                    title="Follow action not wired yet"
                  >
                    Follow
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
