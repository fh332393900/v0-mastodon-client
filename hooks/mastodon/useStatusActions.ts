import { useEffect, useMemo, useState } from "react"
import type { mastodon } from "masto"
import { useMasto } from "@/components/auth/masto-provider"
import { useAuth } from "@/components/auth/auth-provider"
import { useQueryCacheTools } from "@/hooks/cache/useQueryCacheTools"

type Action = "reblogged" | "favourited" | "bookmarked" | "pinned" | "muted"
type CountField = "reblogsCount" | "favouritesCount"

interface StatusActionsProps {
  status: mastodon.v1.Status
} 

export function useStatusActions({ status }: StatusActionsProps) {
  const { client, isReady } = useMasto()
  const { user } = useAuth()
  const { updateInfiniteQueryPages } = useQueryCacheTools()

  const [currentStatus, setCurrentStatus] = useState<mastodon.v1.Status>({ ...status })
  const [isLoading, setIsLoading] = useState<Record<Action, boolean>>({
    reblogged: false,
    favourited: false,
    bookmarked: false,
    pinned: false,
    muted: false,
  })

  useEffect(() => {
    setCurrentStatus({ ...status })
  }, [status])

  const renderedStatus = useMemo(() => currentStatus.reblog ?? currentStatus, [currentStatus])

  const updateRenderedStatus = (partial: Partial<mastodon.v1.Status>) => {
    setCurrentStatus((prev) =>
      prev.reblog
        ? { ...prev, reblog: { ...prev.reblog, ...partial } }
        : { ...prev, ...partial },
    )
  }

  async function toggleStatusAction(
    action: Action,
    fetchNewStatus: () => Promise<mastodon.v1.Status>,
    countField?: CountField,
  ) {
    if (!isReady || !client) return

    const prevCount = countField ? renderedStatus[countField] : undefined
    const isCancel = renderedStatus[action]

    setIsLoading((prev) => ({ ...prev, [action]: true }))

    // Optimistic update
    updateRenderedStatus({
      [action]: !renderedStatus[action],
      ...(countField
        ? {
            [countField]:
              (renderedStatus[countField] ?? 0) + (renderedStatus[action] ? -1 : 1),
          }
        : null),
    })

    try {
      const newStatus = await fetchNewStatus()
      const next = { ...newStatus } as mastodon.v1.Status

      if (isCancel && countField && prevCount === newStatus[countField]) {
        next[countField] = newStatus[countField] - 1
      }

      updateRenderedStatus(next)
      // Update any cached timeline queries containing this status so UI remains consistent.
      updateInfiniteQueryPages(["timeline"], (item: any) => {
        const sid = item.reblog ? item.reblog.id : item.id
        const renderedId = next.reblog ? next.reblog.id : next.id
        if (sid === renderedId || item.id === next.id) {
          return { ...item, ...(next.reblog ? { reblog: next.reblog } : next) }
        }
        return item
      })
    } finally {
      setIsLoading((prev) => ({ ...prev, [action]: false }))
    }
  }

  const canReblog = useMemo(() => {
    if (renderedStatus.visibility === "direct") return false
    if (renderedStatus.visibility !== "private") return true
    return renderedStatus.account.id === user?.id
  }, [renderedStatus.account.id, renderedStatus.visibility, user?.id])

  const toggleReblog = () =>
    toggleStatusAction(
      "reblogged",
      () =>
        client.v1.statuses
          .$select(renderedStatus.id)
          [renderedStatus.reblogged ? "unreblog" : "reblog"]()
          .then((res) => (renderedStatus.reblogged ? res.reblog! : res)),
      "reblogsCount",
    )

  const toggleFavourite = () =>
    toggleStatusAction(
      "favourited",
      () =>
        client.v1.statuses.$select(renderedStatus.id)[
          renderedStatus.favourited ? "unfavourite" : "favourite"
        ](),
      "favouritesCount",
    )

  const toggleBookmark = () =>
    toggleStatusAction(
      "bookmarked",
      () =>
        client.v1.statuses.$select(renderedStatus.id)[
          renderedStatus.bookmarked ? "unbookmark" : "bookmark"
        ](),
    )

  const togglePin = () =>
    toggleStatusAction(
      "pinned",
      () =>
        client.v1.statuses.$select(renderedStatus.id)[
          renderedStatus.pinned ? "unpin" : "pin"
        ](),
    )

  const toggleMute = () =>
    toggleStatusAction(
      "muted",
      () =>
        client.v1.statuses.$select(renderedStatus.id)[
          renderedStatus.muted ? "unmute" : "mute"
        ](),
    )

  return {
    status: currentStatus,
    renderedStatus,
    isLoading,
    canReblog,
    toggleMute,
    toggleReblog,
    toggleFavourite,
    toggleBookmark,
    togglePin,
  }
}
