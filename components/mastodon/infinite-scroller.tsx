"use client"

import { useRef, useEffect, useCallback, type ReactNode } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

interface InfiniteScrollerProps {
  children: ReactNode
  onLoadMore: () => void
  hasMore: boolean
  isLoadingMore: boolean
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-6 mt-6">
      {[...Array(3)].map((_, i) => (
        <Card key={`skeleton-${i}`} className="animate-pulse">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-muted rounded-full" />
              <div className="space-y-2">
                <div className="w-32 h-4 bg-muted rounded" />
                <div className="w-24 h-3 bg-muted rounded" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="w-full h-4 bg-muted rounded" />
              <div className="w-3/4 h-4 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function InfiniteScroller({ children, onLoadMore, hasMore, isLoadingMore }: InfiniteScrollerProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0]
      if (target.isIntersecting && hasMore && !isLoadingMore) {
        onLoadMore()
      }
    },
    [onLoadMore, hasMore, isLoadingMore],
  )

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null, // viewport
      rootMargin: "400px", // trigger 400px before the sentinel is visible
      threshold: 0.1,
    })

    const sentinel = sentinelRef.current
    if (sentinel) {
      observer.observe(sentinel)
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel)
      }
    }
  }, [handleObserver])

  return (
    <div>
      {children}
      <div ref={sentinelRef} aria-hidden="true" className="h-1" />
      {isLoadingMore && <LoadingSkeleton />}
    </div>
  )
}
