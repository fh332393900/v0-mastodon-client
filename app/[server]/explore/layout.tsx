"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const tabs = [
  { href: "", label: "贴文" },
  { href: "tag", label: "标签" },
  { href: "news", label: "最新" },
  { href: "suggested", label: "推荐关注" },
] as const

export default function ExploreLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  const server = pathname.split("/")[1]

  return (
    <div className="space-y-4 px-4 py-6">
      <div className="sticky top-0 z-20 -mx-4 bg-background/80 px-4 pt-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h1 className="text-3xl font-bold">Explore</h1>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {tabs.map((t) => {
            const fullHref = `/${server}/explore/${t.href}`
            const active = pathname.endsWith(`/explore/${t.href}`) || (t.href === "" && pathname.endsWith("/explore"))
            return (
              <Link
                key={t.href}
                href={fullHref}
                className={cn(
                  "whitespace-nowrap rounded-full border px-4 py-2 text-sm transition-colors",
                  active
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/60 bg-card/70 text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </Link>
            )
          })}
        </div>
      </div>

      <div>{children}</div>
    </div>
  )
}
