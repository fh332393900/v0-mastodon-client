"use client"

import { useCallback, useState, useEffect, useMemo } from "react"
import { useMasto } from "@/components/auth/masto-provider"
import { useAuth } from "@/components/auth/auth-provider"
import { InfiniteScroller } from "@/components/mastodon/infinite-scroller"
import { StatusCard } from "@/components/mastodon/status-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { mastodon } from "masto"

type TimelineType = "public" | "home" | "local"

// In-memory cache for timelines to achieve "keep-alive" effect
const timelineCache = new Map<TimelineType, mastodon.v1.Status[]>()
const scrollPositionCache = new Map<TimelineType, number>()

export function TimelineFeed() {
  const [timelineType, setTimelineType] = useState<TimelineType>("home")
  const [posts, setPosts] = useState<mastodon.v1.Status[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const { client, isReady: isMastoReady } = useMasto()
  const { user, isInitialized: isAuthReady } = useAuth()

  const isReady = isMastoReady && isAuthReady

  // Restore from cache on mount or when switching timeline types
  useEffect(() => {
    if (!isReady) return

    const cachedPosts = timelineCache.get(timelineType)
    if (cachedPosts && cachedPosts.length > 0) {
      setPosts(cachedPosts)
      setIsLoading(false)
      // Restore scroll position
      setTimeout(() => {
        window.scrollTo(0, scrollPositionCache.get(timelineType) || 0)
      }, 0)
    } else {
      fetchTimeline(undefined, false)
    }

    // Save scroll position on unmount/switch
    return () => {
      scrollPositionCache.set(timelineType, window.scrollY)
    }
  }, [timelineType, isReady])

  const fetchTimeline = useCallback(
    async (maxId?: string, append = false) => {
      if (!isReady || !client) return

      if (append) setIsLoadingMore(true)
      else setIsLoading(true)

      try {
        const params: any = { limit: 10 }
        if (maxId) params.max_id = maxId

        let res: mastodon.v1.Status[] = []
        const timelineApi = client.v1.timelines
        
        switch (timelineType) {
          case "home":
            if (user) res = await timelineApi.home.list(params)
            break
          case "local":
            res = await timelineApi.public.list({ ...params, local: true })
            break
          case "public":
          default:
            res = await timelineApi.public.list(params)
            break
        }

        const newPosts = res || []
        setPosts((prev) => {
          const currentPosts = append ? prev : []
          const uniqueNewPosts = newPosts.filter((p) => !currentPosts.some((cp) => cp.id === p.id))
          const updatedPosts = [...currentPosts, ...uniqueNewPosts]
          timelineCache.set(timelineType, updatedPosts) // Update cache
          return updatedPosts
        })
        setHasMore(newPosts.length > 0)
      } catch (error) {
        console.error(`Failed to fetch ${timelineType} timeline:`, error)
        setHasMore(false)
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [client, isReady, user, timelineType],
  )

  const handleLoadMore = () => {
    if (posts.length > 0) {
      const lastId = posts[posts.length - 1].id
      fetchTimeline(lastId, true)
    }
  }
  
  const handleTimelineChange = (type: TimelineType) => {
    // Save current scroll position before switching
    scrollPositionCache.set(timelineType, window.scrollY);
    setTimelineType(type);
  };


  const timelineTitle = useMemo(() => {
    switch (timelineType) {
      case "home": return "Home Timeline"
      case "local": return "Local Community"
      case "public": return "Public Fediverse"
    }
  }, [timelineType])

  if (!isReady && isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Loading Timeline...</h1>
        {/* Initial loading skeleton */}
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse bg-card/50 p-4 rounded-lg">
              <div className="h-4 bg-muted w-1/3 rounded"></div>
              <div className="h-4 bg-muted w-3/4 rounded mt-2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">{timelineTitle}</h1>
        <div className="flex items-center space-x-2">
          <div className="flex rounded-lg border border-border/50 p-1">
            {(["public", "local", "home"] as const).map((type) => (
              <Button
                key={type}
                variant={timelineType === type ? "default" : "ghost"}
                size="sm"
                onClick={() => handleTimelineChange(type)}
                className="capitalize text-xs"
                disabled={type === 'home' && !user}
              >
                {type}
              </Button>
            ))}
          </div>
          <Badge variant="outline" className="text-accent border-accent/50">
            {posts.length} posts
          </Badge>
        </div>
      </div>

      <InfiniteScroller
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
      >
        <div className="space-y-6">
          {posts.map((post) => (
            <StatusCard key={post.id} status={post} />
          ))}
        </div>
      </InfiniteScroller>
    </div>
  )
}
