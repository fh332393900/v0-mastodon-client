"use client"

import { useCallback } from "react"
import { useAuth } from "@/components/auth/auth-provider"
import { useMasto } from "@/components/auth/masto-provider"
import type { MastoClient } from "@/components/auth/masto-provider"

export type CreateStatusParams = Parameters<MastoClient["v1"]["statuses"]["create"]>[0]
export type MediaAttachment = Awaited<ReturnType<MastoClient["v2"]["media"]["create"]>>

export function useComposeActions() {
  const { client, isReady: isMastoReady } = useMasto()
  const { isInitialized } = useAuth()

  const isReady = isMastoReady && isInitialized

  const uploadMedia = useCallback(
    async (file: File, description?: string) => {
      if (!client) {
        throw new Error("Mastodon client not ready")
      }

      return client.v2.media.create({
        file,
        description: description?.trim() || undefined,
      })
    },
    [client],
  )

  const createStatus = useCallback(
    async (params: CreateStatusParams) => {
      if (!client) {
        throw new Error("Mastodon client not ready")
      }

      return client.v1.statuses.create(params)
    },
    [client],
  )

  return {
    isReady,
    uploadMedia,
    createStatus,
  }
}
