"use client"

import { useCallback, useMemo } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import type { mastodon } from "masto"
import { useMasto } from "@/components/auth/masto-provider"
import { useAuth } from "@/components/auth/auth-provider"

export interface UseExplorePostsCacheOptions {
  limit?: number
}

/** Trending statuses (Explore -> Posts). */
export function useExplorePostsCache({ limit = 20 }: UseExplorePostsCacheOptions = {}) {
  const { client, isReady: isMastoReady } = useMasto()
  const { isInitialized: isAuthReady } = useAuth()

  const isReady = isMastoReady && isAuthReady

  const queryKey = useMemo(() => ["explore", "posts"] as const, [])

  const fetchPage = useCallback(
    async ({ pageParam }: { pageParam?: string }) => {
      if (!client) return [] as mastodon.v1.Status[]

      const api: any = client.v1 as any

      // masto: client.v1.trends.statuses.list({ limit, offset? }) (offset is common)
      // We use pageParam as offset.
      const offset = pageParam ? Number(pageParam) || 0 : 0
      const params: any = { limit, offset }

      const res = (await api?.trends?.statuses?.list?.(params)) as mastodon.v1.Status[] | undefined
      return res ?? ([] as mastodon.v1.Status[])
    },
    [client, limit],
  )

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage({ pageParam }),
    enabled: isReady && !!client,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage || lastPage.length < limit) return undefined
      return String(pages.length * limit)
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
    isReady,
    limit,
  }
}
