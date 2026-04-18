"use client"

import { useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import type { mastodon } from "masto"
import { useMasto } from "@/components/auth/masto-provider"
import { useAuth } from "@/components/auth/auth-provider"

export interface UseExploreSuggestedAccountsCacheOptions {
  limit?: number
}

/** Suggested accounts (Explore -> Suggested). */
export function useExploreSuggestedAccountsCache({ limit = 20 }: UseExploreSuggestedAccountsCacheOptions = {}) {
  const { client, isReady: isMastoReady } = useMasto()
  const { isInitialized: isAuthReady, user } = useAuth()

  const isReady = isMastoReady && isAuthReady
  const queryKey = useMemo(() => ["explore", "suggested", user ? "authed" : "guest", limit] as const, [user, limit])

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!client) return [] as mastodon.v1.Account[]
      const api: any = client.v1 as any

      // Mastodon suggests are usually for authenticated users.
      const res = (await api?.suggestions?.list?.({ limit })) as mastodon.v1.Account[] | undefined
      return res ?? ([] as mastodon.v1.Account[])
    },
    enabled: isReady && !!client,
    staleTime: 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  })

  const accounts = query.data ?? ([] as mastodon.v1.Account[])

  return {
    queryKey,
    accounts,
    query,
    isReady,
    user,
  }
}
