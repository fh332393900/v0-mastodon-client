"use client"

import { useCallback, useMemo } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import type { mastodon } from "masto"
import { useMasto } from "@/components/auth/masto-provider"
import { useAuth } from "@/components/auth/auth-provider"
import { useQueryCacheTools } from "@/hooks/cache/useQueryCacheTools"

export interface UseFavoritesCacheOptions {
  limit?: number
}

export function useFavoritesCache({ limit = 20 }: UseFavoritesCacheOptions = {}) {
  const { client, isReady: isMastoReady } = useMasto()
  const { user, isInitialized: isAuthReady } = useAuth()
  const { queryClient, updateInfiniteQueryPages } = useQueryCacheTools()

  const isReady = isMastoReady && isAuthReady

  const queryKey = useMemo(() => ["favorites", user ? "authed" : "guest"] as const, [user])

  const fetchPage = useCallback(
    async ({ pageParam }: { pageParam?: string }) => {
      if (!client || !user) return [] as mastodon.v1.Status[]

      const params: any = { limit }
      if (pageParam) params.max_id = pageParam

      const res = await client.v1.favourites.list(params)
      return res ?? []
    },
    [client, limit, user],
  )

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage({ pageParam }),
    enabled: isReady && !!client && !!user,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.length < limit) return undefined
      return lastPage[lastPage.length - 1]?.id
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
    isReady,
    user,
    updateFavoritesCache: (updater: (status: mastodon.v1.Status) => mastodon.v1.Status) =>
      updateInfiniteQueryPages(["favorites"], (item) => updater(item)),
  }
}
