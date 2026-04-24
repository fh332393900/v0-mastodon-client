'use client'

import { useEffect, useMemo, useState } from "react"
import type { mastodon } from "masto"
import { useMasto } from "@/components/auth/masto-provider"
import { getAccountLookupCandidates } from "@/lib/mastodon/account"
import { UserHoverCard } from "@/components/mastodon/user-hover-card"
import { getAccountProfileHref } from "@/lib/mastodon/account"

export default function AccountHoverWrapper({
  handle,
  children,
}: {
  handle: string
  children: React.ReactNode
}) {
  const { client, server } = useMasto()
  const [account, setAccount] = useState<mastodon.v1.Account | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  const lookupCandidates = useMemo(() => {
    if (!server || !handle) return []
    return getAccountLookupCandidates(server, handle)
  }, [handle, server])

  const profileHref = useMemo(() => {
    if (!account) return undefined
    return getAccountProfileHref(account, server ?? "")
  }, [account, server])

  useEffect(() => {
    if (!client || isLoaded || lookupCandidates.length === 0) return

    let cancelled = false
    const lookup = async () => {
      for (const acct of lookupCandidates) {
        try {
          const profile = await client.v1.accounts.lookup({ acct })
          if (!cancelled) {
            setAccount(profile)
            setIsLoaded(true)
          }
          return
        } catch {
          // try next
        }
      }

      if (!cancelled) {
        setIsLoaded(true)
      }
    }

    lookup()

    return () => {
      cancelled = true
    }
  }, [client, isLoaded, lookupCandidates])

  if (account) {
    return (
      <UserHoverCard account={account} profileHref={profileHref}>
        {children}
      </UserHoverCard>
    )
  }

  return (
    <span title={handle} className="hover:underline cursor-pointer text-blue-500">
      {children}
    </span>
  )
}
