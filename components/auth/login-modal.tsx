"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MessageCircle, ArrowRight, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"

const POPULAR_SERVERS = [
  { name: "Mastodon Social", host: "mastodon.social", desc: "官方旗舰站，最大实例" },
  { name: "Mastodon Online", host: "mastodon.online", desc: "面向大众的通用实例" },
  { name: "Fosstodon", host: "fosstodon.org", desc: "开源与技术爱好者社区" },
  { name: "Infosec Exchange", host: "infosec.exchange", desc: "信息安全从业者聚集地" },
  { name: "Webtoo.ls", host: "m.webtoo.ls", desc: "技术与极客爱好者社区" },
  { name: "Hachyderm", host: "hachyderm.io", desc: "科技工作者与创作者" },
]

interface LoginModalProps {
  children: React.ReactNode
}

export function LoginModal({ children }: LoginModalProps) {
  const [server, setServer] = useState("")
  const [open, setOpen] = useState(false)
  const [error, setError] = useState("")
  const { login, isLoading } = useAuth()

  const handleLogin = async () => {
    if (!server) {
      setError("请输入服务器地址！")
      return
    }
    setError("")
    await login(server)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-card/95 backdrop-blur-sm border-border/50">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-2xl font-bold text-center">登录 Mastodon</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            选择热门服务器或手动输入服务器地址
          </DialogDescription>
        </DialogHeader>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 pt-2">
          {/* 热门服务器卡片 */}
          <div className="grid grid-cols-3 gap-2">
            {POPULAR_SERVERS.map((s) => (
              <button
                key={s.host}
                type="button"
                disabled={isLoading}
                onClick={() => { setServer(s.host); setError("") }}
                className={cn(
                  "flex flex-col items-start gap-0.5 rounded-xl border px-3 py-2.5 text-left transition-all",
                  "hover:border-primary/60 hover:bg-primary/5 cursor-pointer",
                  server === s.host
                    ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                    : "border-border bg-muted/30",
                  isLoading && "opacity-50 cursor-not-allowed",
                )}
              >
                <span className="text-xs font-semibold text-foreground leading-tight">{s.name}</span>
                <span className="text-[10px] text-primary/80 leading-tight">{s.host}</span>
                <span className="mt-1 text-[10px] text-muted-foreground leading-snug line-clamp-2">{s.desc}</span>
              </button>
            ))}
          </div>

          {/* 分隔线 */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">或手动输入</span>
            </div>
          </div>

          {/* 手动输入 */}
          <div className="space-y-2">
            <Label htmlFor="server" className="text-sm font-medium">服务器地址</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground select-none">
                https://
              </span>
              <Input
                id="server"
                type="text"
                placeholder="mastodon.social"
                value={server}
                onChange={(e) => { setServer(e.target.value); setError("") }}
                onKeyPress={handleKeyPress}
                className="pl-16 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3"
            >
              {error}
            </motion.div>
          )}

          <Button
            onClick={handleLogin}
            disabled={!server || isLoading}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-300 text-primary-foreground font-medium"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                正在跳转...
              </>
            ) : (
              <>
                <MessageCircle className="w-4 h-4 mr-2" />
                登录
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
