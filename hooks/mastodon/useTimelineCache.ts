"use client"

import { useCallback, useMemo } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import type { mastodon } from "masto"
import { useMasto } from "@/components/auth/masto-provider"
import { useAuth } from "@/components/auth/auth-provider"
import { useQueryCacheTools } from "@/hooks/cache/useQueryCacheTools"

export type TimelineType = "public" | "home" | "local"

export interface UseTimelineCacheOptions {
  timelineType: TimelineType
  limit?: number
}

export function useTimelineCache({ timelineType, limit = 20 }: UseTimelineCacheOptions) {
  const { client, isReady: isMastoReady } = useMasto()
  const { user, isInitialized: isAuthReady } = useAuth()
  const { queryClient, updateInfiniteQueryPages } = useQueryCacheTools()

  const isReady = isMastoReady && isAuthReady

  const queryKey = useMemo(
    () => ["timeline", timelineType, user ? "authed" : "public"] as const,
    [timelineType, user],
  )

  const fetchPage = useCallback(
    async ({ pageParam }: { pageParam?: string }) => {
      if (!client) return [] as mastodon.v1.Status[]

      const params: any = { limit }
      if (pageParam) params.max_id = pageParam

      const timelineApi = client.v1.timelines
      let res: mastodon.v1.Status[] = []

      switch (timelineType) {
        case "home":
          if (user) res = await timelineApi.home.list(params)
          else res = await timelineApi.public.list({ ...params, local: true })
          break
        case "local":
          res = await timelineApi.public.list({ ...params, local: true })
          break
        case "public":
        default:
          res = await timelineApi.public.list(params)
          break
      }

      return res ?? []
    },
    [client, limit, timelineType, user],
  )

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage({ pageParam }),
    enabled: isReady && !!client && (timelineType !== "home" || !!user),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      // Only stop when the page is truly empty — Mastodon may return fewer
      // items than `limit` even when more data exists (filtered/boosted posts).
      if (!lastPage || lastPage.length === 0) return undefined
      const lastId = lastPage[lastPage.length - 1]?.id
      if (!lastId) return undefined
      if (lastPageParam && lastId === lastPageParam) return undefined
      return lastId
    },
    staleTime: 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  })

  const posts = useMemo(() => {
    const pages = query.data?.pages ?? []
    const seen = new Set<string>()
    const out: mastodon.v1.Status[] = []
    for (const page of pages) {
      for (const s of page) {
        if (!seen.has(s.id)) {
          seen.add(s.id)
          out.push(s)
        }
      }
    }
    return out
  }, [query.data])

  return {
    queryKey,
    posts,
    query,
    queryClient,
    updateTimelineCache: (updater: (status: mastodon.v1.Status) => mastodon.v1.Status) =>
      updateInfiniteQueryPages(["timeline"], (item) => {
        const rendered = item.reblog ? item.reblog : item
        const updated = updater(rendered)
        return item.reblog ? { ...item, reblog: updated } : updated
      }),
    isReady,
    user,
    limit,
  }
}
