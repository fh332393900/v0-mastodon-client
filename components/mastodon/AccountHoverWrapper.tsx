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
  const [lookupStarted, setLookupStarted] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const lookupCandidates = useMemo(() => {
    if (!server || !handle) return []
    return getAccountLookupCandidates(server, handle)
  }, [handle, server])

  const profileHref = useMemo(() => {
    if (!account) return undefined
    return getAccountProfileHref(account, server ?? "")
  }, [account, server])

  useEffect(() => {
    if (!lookupStarted || !client || isLoaded || lookupCandidates.length === 0) return

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
  }, [client, isLoaded, lookupCandidates, lookupStarted])

  const handleLookupTrigger = () => {
    if (!lookupStarted && !isLoaded && lookupCandidates.length > 0) {
      setLookupStarted(true)
    }
    setIsHovering(true)
  }

  const handleLookupLeave = () => {
    setIsHovering(false)
  }

  if (account) {
    return (
      <UserHoverCard account={account} profileHref={profileHref} forceOpen={isHovering}>
        {children}
      </UserHoverCard>
    )
  }

  return (
    <span title={handle} className="hover:underline cursor-pointer text-blue-500">
      <span
        onMouseEnter={handleLookupTrigger}
        onFocus={handleLookupTrigger}
        onMouseLeave={handleLookupLeave}
        onBlur={handleLookupLeave}
      >
        {children}
      </span>
    </span>
  )
}
