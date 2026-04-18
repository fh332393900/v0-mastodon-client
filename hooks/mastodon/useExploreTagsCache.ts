"use client"

import { useCallback, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import type { mastodon } from "masto"
import { useMasto } from "@/components/auth/masto-provider"
import { useAuth } from "@/components/auth/auth-provider"

export interface UseExploreTagsCacheOptions {
  limit?: number
}

/** Trending tags (Explore -> Tag). */
export function useExploreTagsCache({ limit = 20 }: UseExploreTagsCacheOptions = {}) {
  const { client, isReady: isMastoReady } = useMasto()
  const { isInitialized: isAuthReady } = useAuth()

  const isReady = isMastoReady && isAuthReady
  const queryKey = useMemo(() => ["explore", "tags", limit] as const, [limit])

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!client) return [] as mastodon.v1.Tag[]
      const api: any = client.v1 as any
      const res = (await api?.trends?.tags?.list?.({ limit })) as mastodon.v1.Tag[] | undefined
      return res ?? ([] as mastodon.v1.Tag[])
    },
    enabled: isReady && !!client,
    staleTime: 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  })

  const tags = query.data ?? ([] as mastodon.v1.Tag[])

  return {
    queryKey,
    tags,
    query,
    isReady,
  }
}
