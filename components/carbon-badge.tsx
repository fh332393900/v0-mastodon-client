"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useTranslations } from "next-intl"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Leaf } from "lucide-react"

interface CarbonData {
  c: number
  p: number
}

const FALLBACK: CarbonData = { c: 0.09, p: 84 }

export function CarbonBadge() {
  const t = useTranslations("carbonBadge")
  const [data, setData] = useState<CarbonData | null>(null)
  const [open, setOpen] = useState(false)
  const closeTimer = useRef<number | null>(null)

  const scheduleClose = () => {
    closeTimer.current = window.setTimeout(() => setOpen(false), 120)
  }
  const cancelClose = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current)
  }

  useEffect(() => {
    const url = typeof window !== "undefined" ? encodeURIComponent(window.location.origin) : ""
    fetch(`https://api.websitecarbon.com/b?url=${url}`)
      .then((r) => {
        if (!r.ok) throw new Error("non-ok")
        return r.json()
      })
      .then((json) => setData({ c: Number(json.c), p: Number(json.p) }))
      .catch(() => setData(FALLBACK))
  }, [])

  const d = data ?? FALLBACK

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Link
          href="https://www.websitecarbon.com/website/v0-mastodon-client-vercel-app/"
          target="_blank"
          rel="noreferrer"
          onMouseEnter={() => { cancelClose(); setOpen(true) }}
          onMouseLeave={scheduleClose}
          className="inline-flex border-none bg-[#8eff43] text-[#1a2e00] items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold cursor-pointer select-none transition-opacity hover:opacity-90"
          aria-label={t("ariaLabel")}
        >
          <Leaf className="h-3 w-3 shrink-0" />
          {data === null ? (
            <span className="opacity-50">{t("calculating")}</span>
          ) : (
            <span>
              <span className="font-extrabold">{d.c}g</span>
              {" "}{t("badgeMiddle")}{" "}
              <span className="font-extrabold">{d.p}%</span>
            </span>
          )}
        </Link>
      </PopoverTrigger>
      <PopoverContent side="top" align="center" className="w-72 p-4 text-sm bg-card" onMouseEnter={cancelClose} onMouseLeave={scheduleClose}>
        <div className="flex items-start gap-3">
          <div
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
            style={{ background: "#8eff43" }}
          >
            <Leaf className="h-4 w-4" style={{ color: "#1a2e00" }} />
          </div>
          <div className="space-y-2 min-w-0">
            <p className="font-semibold text-foreground leading-snug">{t("title")}</p>
            <p className="text-foreground/80 text-xs leading-relaxed">
              {t("descriptionPrefix")}{" "}
              <span
                className="font-extrabold text-sm px-1 rounded"
                style={{ background: "#8eff43", color: "#1a2e00" }}
              >
                {d.c}g
              </span>{" "}
              {t("descriptionSuffix")}
            </p>
            <p className="text-foreground/80 text-xs leading-relaxed">
              {t("cleanerPrefix")}{" "}
              <span
                className="font-extrabold text-sm px-1 rounded"
                style={{ background: "#8eff43", color: "#1a2e00" }}
              >
                {d.p}%
              </span>{" "}
              {t("cleanerSuffix")}
            </p>
            <a
              href="https://www.websitecarbon.com"
              target="_blank"
              rel="noreferrer"
              className="block text-xs text-primary/80 hover:text-primary hover:underline transition-colors"
            >
              {t("learnMore")}
            </a>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
