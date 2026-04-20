"use client"

import { useQuery } from "@tanstack/react-query"
import { useMasto } from "@/components/auth/masto-provider"
import { useAuth } from "@/components/auth/auth-provider"
import type { MastoClient } from "@/components/auth/masto-provider"

export type InstanceConfig = Awaited<ReturnType<MastoClient["v1"]["instance"]["fetch"]>>

export function useInstanceConfig() {
  const { client, isReady: isMastoReady } = useMasto()
  const { isInitialized } = useAuth()

  const isReady = isMastoReady && isInitialized

  const query = useQuery<InstanceConfig>({
    queryKey: ["instance-config"],
    enabled: isReady && !!client,
    queryFn: async () => {
      if (!client) {
        throw new Error("Mastodon client not ready")
      }
      return client.v1.instance.fetch()
    },
    staleTime: 5 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnWindowFocus: false,
  })

  const maxCharacters = query.data?.configuration?.statuses?.maxCharacters ?? 500
  const maxMediaAttachments = query.data?.configuration?.statuses?.maxMediaAttachments ?? 4
  const maxPollOptions = query.data?.configuration?.polls?.maxOptions ?? 4

  return {
    query,
    data: query.data,
    maxCharacters,
    maxMediaAttachments,
    maxPollOptions,
  }
}
