"use client"

import { useCallback } from "react"
import { useQueryClient } from "@tanstack/react-query"

export type QueryKeyPrefix = string | readonly unknown[]

const isPrefixMatch = (key: readonly unknown[], prefix: QueryKeyPrefix) => {
  if (typeof prefix === "string") return key[0] === prefix
  if (prefix.length > key.length) return false
  return prefix.every((value, index) => key[index] === value)
}

export function useQueryCacheTools() {
  const queryClient = useQueryClient()

  const getQueriesByPrefix = useCallback(
    (prefix: QueryKeyPrefix) =>
      queryClient
        .getQueryCache()
        .findAll()
        .filter((q) => Array.isArray(q.queryKey) && isPrefixMatch(q.queryKey, prefix)),
    [queryClient],
  )

  const updateInfiniteQueryPages = useCallback(
    (prefix: QueryKeyPrefix, updater: (item: any) => any) => {
      const queries = getQueriesByPrefix(prefix)
      for (const q of queries) {
        const key = q.queryKey
        if (!Array.isArray(key)) continue

        queryClient.setQueryData(key as any, (old: any) => {
          if (!old || !old.pages) return old
          const pages = old.pages.map((page: any) => page.map((item: any) => updater(item)))
          return { ...old, pages }
        })
      }
    },
    [getQueriesByPrefix, queryClient],
  )

  return {
    queryClient,
    getQueriesByPrefix,
    updateInfiniteQueryPages,
  }
}
