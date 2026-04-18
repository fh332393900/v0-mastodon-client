"use client"

import { useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useMasto } from "@/components/auth/masto-provider"
import { useAuth } from "@/components/auth/auth-provider"

export interface UseExploreNewsCacheOptions {
  limit?: number
}

export type ExploreTrendingLink = {
  url: string
  title?: string
  description?: string
  authorName?: string
}

/** Trending links (Explore -> News/Links). */
export function useExploreNewsCache({ limit = 20 }: UseExploreNewsCacheOptions = {}) {
  const { client, isReady: isMastoReady } = useMasto()
  const { isInitialized: isAuthReady } = useAuth()

  const isReady = isMastoReady && isAuthReady
  const queryKey = useMemo(() => ["explore", "news", limit] as const, [limit])

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!client) return [] as ExploreTrendingLink[]
      const api: any = client.v1 as any

      // masto types differ between server versions, keep it flexible.
      const raw = (await api?.trends?.links?.list?.({ limit })) as any[] | undefined
      const arr = raw ?? []

      return arr
        .map((x) => ({
          url: String(x?.url ?? ""),
          title: x?.title,
          description: x?.description,
          authorName: x?.authorName ?? x?.author_name,
        }))
        .filter((x) => !!x.url)
    },
    enabled: isReady && !!client,
    staleTime: 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  })

  const links = query.data ?? ([] as ExploreTrendingLink[])

  return {
    queryKey,
    links,
    query,
    isReady,
  }
}
