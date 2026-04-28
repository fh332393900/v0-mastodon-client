"use client"

import { useLocale, useTranslations } from "next-intl"

/**
 * Custom hook for formatting numbers and dates based on the current locale.
 * @returns An object containing formatting functions.
 */
export function useFormat() {
  const locale = useLocale()
  const t = useTranslations()

  /**
   * Format a number into a compact, localized string.
   * @param value The number to format.
   * @returns A localized, compact string representation of the number.
   */
  function formatCompactNumber(value: number): string {
    const resolvedLocale = locale ?? "en-US"

    try {
      return new Intl.NumberFormat(resolvedLocale, {
        notation: "compact",
        compactDisplay: "short",
        maximumFractionDigits: 1,
      }).format(value)
    } catch {
      // 降级：直接返回原始数字字符串
      return String(value)
    }
  }

  /**
   * Convert a value to a valid Date object or null if invalid.
   * @param value The value to convert.
   * @returns A valid Date object or null if the value is invalid.
   */
  function toValidDate(value: unknown): Date | null {
    if (value instanceof Date) {
      return Number.isFinite(value.getTime()) ? value : null
    }
    if (typeof value === "string") {
      const d = new Date(value)
      return Number.isFinite(d.getTime()) ? d : null
    }
    return null
  }

  /**
   * Format a date value into a relative time string.
   * @param value The date value to format.
   * @returns A relative time string, e.g., "just now", "3 minutes ago".
   */
  function formatRelativeTime(value: string | Date | null | undefined): string {
    const date = toValidDate(value)
    if (!date) return ""

    const now = Date.now()
    const diffMs = now - date.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)
    const diffMonth = Math.floor(diffDay / 30)
    const diffYear = Math.floor(diffDay / 365)

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

    if (diffSec < 60) {
      return t("common.justNow")
    }
    if (diffMin < 60) return rtf.format(-diffMin, "minute")
    if (diffHour < 24) return rtf.format(-diffHour, "hour")
    if (diffDay < 30) return rtf.format(-diffDay, "day")
    if (diffMonth < 12) return rtf.format(-diffMonth, "month")
    return rtf.format(-diffYear, "year")
  }

  /**
   * Full date time, used for title tooltip
   */
  function formatFullDate(value: string | Date): string {
    const resolvedLocale = locale ?? "en-US"
    const date = toValidDate(value)
    if (!date) return ""
    return new Intl.DateTimeFormat(resolvedLocale, {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return {
    formatCompactNumber,
    formatRelativeTime,
    formatFullDate,
  }
}
