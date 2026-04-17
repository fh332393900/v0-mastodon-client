"use client"

import { useCallback, useMemo } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import type { mastodon } from "masto"
import { useMasto } from "@/components/auth/masto-provider"
import { useAuth } from "@/components/auth/auth-provider"
import { useQueryCacheTools } from "@/hooks/cache/useQueryCacheTools"

export interface UseTagTimelineCacheOptions {
  tag: string
  limit?: number
}

export function useTagTimelineCache({ tag, limit = 20 }: UseTagTimelineCacheOptions) {
  const { client, isReady: isMastoReady } = useMasto()
  const { isInitialized: isAuthReady } = useAuth()
  const { queryClient, updateInfiniteQueryPages } = useQueryCacheTools()

  const isReady = isMastoReady && isAuthReady

  const normalizedTag = useMemo(() => tag.trim().replace(/^#/, ""), [tag])
  const queryKey = useMemo(() => ["tag-timeline", normalizedTag] as const, [normalizedTag])

  const fetchPage = useCallback(
    async ({ pageParam }: { pageParam?: string }) => {
      if (!client || !normalizedTag) return [] as mastodon.v1.Status[]

      const params: any = { limit }
      if (pageParam) params.max_id = pageParam

      const timelines: any = client.v1.timelines as any
      if (timelines?.tag?.$select) {
        return (await timelines.tag.$select(normalizedTag).list(params)) ?? []
      }
      if (timelines?.tag?.list) {
        return (await timelines.tag.list({ ...params, tag: normalizedTag })) ?? []
      }

      return []
    },
    [client, limit, normalizedTag],
  )

  const query = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchPage({ pageParam }),
    enabled: isReady && !!client && !!normalizedTag,
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage, _pages, lastPageParam) => {
      if (!lastPage || lastPage.length < limit) return undefined
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
    isReady,
    updateTagCache: (updater: (status: mastodon.v1.Status) => mastodon.v1.Status) =>
      updateInfiniteQueryPages(["tag-timeline", normalizedTag], (item) => updater(item)),
  }
}
