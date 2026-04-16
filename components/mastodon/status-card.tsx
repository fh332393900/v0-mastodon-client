"use client"

import { useState } from "react"
import Link from "next/link"
import { Globe, MessageCircle, Repeat2, Heart, Pin, Share } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import MastodonContent from "@/components/mastodon/MastodonContent"
import { cn } from "@/lib/utils"
import type { mastodon } from "masto"

type Status = mastodon.v1.Status

type StatusCardProps = {
  status: Status
  /** Optional: profile server context so we can link to account pages if desired */
  server?: string
  /** Optional: pass false to hide action buttons */
  showActions?: boolean
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export function StatusCard({ status, server, showActions = true }: StatusCardProps) {
  const renderedStatus = status.reblog ?? status
  const author = renderedStatus.account

  const profileHref = server ? `/${server}/profile/${author.acct}` : undefined

  const [isLiked, setIsLiked] = useState(renderedStatus.favourited)
  const [isReposted, setIsReposted] = useState(renderedStatus.reblogged)
  const [likes, setLikes] = useState(renderedStatus.favouritesCount)
  const [reposts, setReposts] = useState(renderedStatus.reblogsCount)

  const handleLike = async () => {
    try {
      const method = isLiked ? "DELETE" : "POST"
      const response = await fetch(`/api/posts/${renderedStatus.id}/favourite`, {
        method,
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        setIsLiked(!isLiked)
        setLikes(isLiked ? likes - 1 : likes + 1)
      }
    } catch (error) {
      console.error("Failed to toggle like:", error)
    }
  }

  const handleRepost = async () => {
    try {
      const method = isReposted ? "DELETE" : "POST"
      const response = await fetch(`/api/posts/${renderedStatus.id}/reblog`, {
        method,
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        setIsReposted(!isReposted)
        setReposts(isReposted ? reposts - 1 : reposts + 1)
      }
    } catch (error) {
      console.error("Failed to toggle repost:", error)
    }
  }

  return (
    <article className="rounded-3xl border border-border/70 bg-card/90 p-5 shadow-sm">
      {status.reblog ? (
        <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Repeat2 className="h-3.5 w-3.5" />
          <span>{status.account.displayName || status.account.username} 转发了这条贴文</span>
        </div>
      ) : null}

      <div className="flex gap-4">
        {profileHref ? (
          <Link href={profileHref}>
            <Avatar className="h-12 w-12 ring-2 ring-border/70">
              <AvatarImage src={author.avatar} alt={author.displayName} />
              <AvatarFallback>{author.displayName?.charAt(0) || author.username.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
        ) : (
          <Avatar className="h-12 w-12 ring-2 ring-border/70">
            <AvatarImage src={author.avatar} alt={author.displayName} />
            <AvatarFallback>{author.displayName?.charAt(0) || author.username.charAt(0)}</AvatarFallback>
          </Avatar>
        )}

        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {profileHref ? (
              <Link href={profileHref} className="font-semibold text-foreground hover:text-primary">
                {author.displayName || author.username}
              </Link>
            ) : (
              <span className="font-semibold text-foreground">{author.displayName || author.username}</span>
            )}
            <span className="text-sm text-muted-foreground">@{author.acct}</span>
            <span className="text-sm text-muted-foreground">- {formatDate(renderedStatus.createdAt)}</span>
            <Badge variant="outline" className="capitalize">
              <Globe className="mr-1 h-3 w-3" />
              {renderedStatus.visibility}
            </Badge>
            {renderedStatus.pinned ? (
              <Badge variant="outline">
                <Pin className="mr-1 h-3 w-3" />置顶
              </Badge>
            ) : null}
          </div>

          {renderedStatus.spoilerText ? (
            <div className="rounded-2xl bg-muted/70 px-4 py-3 text-sm text-muted-foreground">
              {renderedStatus.spoilerText}
            </div>
          ) : null}

          <div className="[&_.prose]:max-w-none [&_.prose]:text-sm [&_.prose_a]:text-primary [&_.prose_p]:my-2">
            <MastodonContent content={renderedStatus.content} />
          </div>

          {renderedStatus.mediaAttachments.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {renderedStatus.mediaAttachments.map((item) => (
                <div key={item.id} className="overflow-hidden rounded-2xl border border-border/60 bg-muted/40">
                  {item.type === "image" ? (
                    <img
                      src={item.previewUrl || item.url || undefined}
                      alt={item.description || "media"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <video src={item.url || undefined} controls className="h-full w-full" />
                  )}
                </div>
              ))}
            </div>
          ) : null}

          {showActions ? (
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-sm text-muted-foreground">
              <div className="flex flex-wrap gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4" />
                  {renderedStatus.repliesCount}
                </span>

                <button
                  type="button"
                  onClick={handleRepost}
                  className={cn(
                    "inline-flex items-center gap-1.5 transition-colors",
                    isReposted ? "text-green-500" : "hover:text-green-500",
                  )}
                >
                  <Repeat2 className="h-4 w-4" />
                  {reposts}
                </button>

                <button
                  type="button"
                  onClick={handleLike}
                  className={cn(
                    "inline-flex items-center gap-1.5 transition-colors",
                    isLiked ? "text-red-500" : "hover:text-red-500",
                  )}
                >
                  <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
                  {likes}
                </button>
              </div>

              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary transition-colors">
                <Share className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}
