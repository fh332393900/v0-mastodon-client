"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LoginModal } from "@/components/auth/login-modal"
import {
  MessageCircle,
  Globe,
  Zap,
  Shield,
  Heart,
  ArrowRight,
  Github,
  Lock,
  Rss,
  Users,
} from "lucide-react"
import { useMasto } from "@/components/auth/masto-provider"

export default function HomePage() {
  const router = useRouter()
  const { server, accessToken } = useMasto()

  useEffect(() => {
    if (accessToken) {
      router.replace(`/${server}/timeline`)
    }
  }, [accessToken, router, server])

  const handleGuestMode = () => {
    router.push(`/${server}/timeline`)
  }

  if (accessToken) return null

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#0a0a0f] text-foreground antialiased">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 flex items-center justify-between px-8 py-4 bg-[#f5f5f7]/80 dark:bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <MessageCircle className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="text-[15px] font-semibold tracking-tight text-foreground">MastoClient</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LoginModal>
            <Button size="sm" className="rounded-full px-5 h-8 text-xs font-medium bg-foreground text-background hover:bg-foreground/90">
              登录
            </Button>
          </LoginModal>
        </div>
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="relative overflow-hidden px-6 pt-20 pb-0 md:pt-28">
          {/* background orbs */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[600px] w-[800px] rounded-full bg-gradient-to-b from-violet-400/20 via-indigo-400/10 to-transparent blur-3xl dark:from-violet-600/15 dark:via-indigo-600/8" />
          </div>

          <div className="mx-auto max-w-5xl text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 dark:border-violet-800/60 bg-violet-50 dark:bg-violet-950/40 px-4 py-1.5 text-xs font-medium text-violet-600 dark:text-violet-400">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
              去中心化 · 无广告 · 完全开放
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.08] text-foreground">
              社交网络，<br />
              <span className="bg-gradient-to-r from-violet-600 via-indigo-500 to-blue-500 bg-clip-text text-transparent">
                不出售你的数据
              </span>
            </h1>

            <p className="mx-auto max-w-xl text-[17px] text-muted-foreground leading-relaxed">
              一个现代、快速、精美的 Mastodon 客户端。<br />
              连接去中心化社交网络，掌控你的数字生活。
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <LoginModal>
                <Button
                  size="lg"
                  className="h-12 px-8 rounded-full font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-xl shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 hover:scale-[1.02]"
                >
                  立即开始
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </LoginModal>
              <Button
                size="lg"
                variant="outline"
                onClick={handleGuestMode}
                className="h-12 px-8 rounded-full font-medium border-foreground/15 dark:border-foreground/10 hover:bg-foreground/5 transition-all duration-200"
              >
                <Globe className="w-4 h-4 mr-1.5" />
                访客浏览
              </Button>
            </div>

            {/* stats */}
            <div className="flex justify-center gap-10 pt-6 pb-2">
              {[
                { value: "10M+", label: "活跃用户" },
                { value: "10K+", label: "独立实例" },
                { value: "100%", label: "无广告" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* App preview card */}
          <div className="relative mx-auto mt-14 max-w-4xl">
            <div className="relative rounded-2xl overflow-hidden border border-black/8 dark:border-white/8 shadow-[0_30px_80px_-10px_rgba(0,0,0,0.18)] dark:shadow-[0_30px_80px_-10px_rgba(0,0,0,0.5)] bg-white dark:bg-[#111116]">
              {/* fake titlebar */}
              <div className="flex items-center gap-2 px-5 py-3 bg-[#f0f0f5] dark:bg-[#1a1a22] border-b border-black/5 dark:border-white/5">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-4 text-xs text-muted-foreground/60 font-mono">mastoclient.app / timeline</span>
              </div>
              {/* preview body */}
              <div className="flex">
                {/* sidebar stub */}
                <div className="hidden md:flex flex-col gap-5 px-6 py-8 border-r border-black/5 dark:border-white/5 min-w-[180px] bg-[#fafafa] dark:bg-[#0f0f14]">
                  {["Home", "Favorites", "Compose", "Explore", "Settings"].map((item, i) => (
                    <div key={item} className={`flex items-center gap-2.5 text-sm ${i === 0 ? "text-violet-600 dark:text-violet-400 font-semibold" : "text-muted-foreground/60"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${i === 0 ? "bg-violet-500" : "bg-muted-foreground/20"}`} />
                      {item}
                    </div>
                  ))}
                </div>
                {/* feed stub */}
                <div className="flex-1 p-5 space-y-4">
                  {[
                    { name: "Post Growth Institute", handle: "@postgrowthinstitute", avatar: "P", text: "Ceechu 4 is now available: the first magazine about New Economies in Spanish.", likes: 6, reblogs: 1 },
                    { name: "Formula 1 🏎", handle: "@formula1bot", avatar: "F", text: "Round 4 of the F1 Sim Racing Championship is coming to you LIVE tonight 🏁 Session times confirmed 🎙", likes: 8, reblogs: 3 },
                    { name: "Tech Weekly", handle: "@techweekly", avatar: "T", text: "The open web is thriving. Fediverse reaches new milestones in 2026 — more servers, more communities, more voices.", likes: 24, reblogs: 7 },
                  ].map((post) => (
                    <div key={post.handle} className="flex gap-3 rounded-2xl border border-border/50 bg-card/60 p-4">
                      <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                        {post.avatar}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold truncate">{post.name}</span>
                          <span className="text-xs text-muted-foreground truncate">{post.handle}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{post.text}</p>
                        <div className="flex gap-5 pt-1 text-xs text-muted-foreground/60">
                          <span>💬 2</span>
                          <span>🔁 {post.reblogs}</span>
                          <span>❤️ {post.likes}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* glow under card */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20 bg-violet-500/20 blur-3xl rounded-full pointer-events-none" />
          </div>
        </section>

        {/* ── Bento feature grid ── */}
        <section className="mx-auto max-w-5xl px-6 pt-32 pb-8">
          <div className="text-center space-y-3 mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">一切你需要的，<span className="text-muted-foreground font-normal">都在这里</span></h2>
            <p className="text-muted-foreground text-[15px]">精心设计的每一个细节，只为更好的社交体验。</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Large card - One account */}
            <div className="md:col-span-2 rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-8 text-white shadow-xl shadow-violet-500/20 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute right-12 bottom-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/3" />
              <p className="text-xs font-semibold uppercase tracking-widest text-violet-200 mb-3">连接所有服务器</p>
              <h3 className="text-2xl md:text-3xl font-bold leading-snug mb-3">
                一个账号，<br />无限连接
              </h3>
              <p className="text-sm text-violet-100/80 max-w-xs leading-relaxed">
                关注任意服务器上的用户。共同构建更好的互联网。
              </p>
            </div>

            {/* Your timeline */}
            <div className="rounded-3xl bg-white dark:bg-[#111116] border border-black/6 dark:border-white/6 p-7 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-green-50 dark:bg-green-950/40 border border-green-100 dark:border-green-900/50 flex items-center justify-center">
                <Rss className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg leading-snug mb-1.5">你的时间轴，<br />你的规则</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">无算法，纯时序。看到你真正想看的内容。</p>
              </div>
              <div className="space-y-1.5 pt-1">
                {["Home", "Favorites", "Compose", "Explore"].map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy */}
            <div className="rounded-3xl bg-white dark:bg-[#111116] border border-black/6 dark:border-white/6 p-7 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1.5">隐私优先</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">你的数据属于你。我们保护你的隐私，而非出售它。</p>
              </div>
            </div>

            {/* Open source */}
            <div className="rounded-3xl bg-[#0d1117] dark:bg-[#0d1117] p-7 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                <Github className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1.5 text-white">开放源码，<br />社区驱动</h3>
                <p className="text-sm text-white/50 leading-relaxed">全球开发者共同构建，透明、可审计、可信赖。</p>
              </div>
            </div>

            {/* Available everywhere */}
            <div className="rounded-3xl bg-white dark:bg-[#111116] border border-black/6 dark:border-white/6 p-7 shadow-sm space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/50 flex items-center justify-center">
                <Globe className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1.5">随处可用</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">在网页、桌面或移动端无缝使用，体验始终如一。</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Feature list (4 points) ── */}
        <section className="mx-auto max-w-5xl px-6 pt-16 pb-8">
          <div className="grid md:grid-cols-2 gap-x-16 gap-y-8">
            {[
              { icon: Users, title: "去中心化", desc: "连接跨服务器，数据归你所有。任何人无法掌控整个网络。" },
              { icon: Github, title: "开放源码", desc: "代码完全透明，社区共同审计，没有隐藏逻辑。" },
              { icon: Rss, title: "时序动态流", desc: "按时间顺序看到真实内容，无推荐算法干预。" },
              { icon: Shield, title: "隐私保护", desc: "无广告，无追踪，无操纵。这是我们的承诺。" },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 items-start">
                <div className="w-9 h-9 shrink-0 rounded-xl bg-foreground/5 dark:bg-foreground/8 border border-foreground/8 flex items-center justify-center">
                  <item.icon className="w-4.5 h-4.5 text-foreground/70" />
                </div>
                <div>
                  <div className="font-semibold text-[15px] mb-1">{item.title}</div>
                  <div className="text-sm text-muted-foreground leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 p-12 text-center text-white shadow-2xl shadow-violet-500/25">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />
            <div className="relative space-y-5">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">准备好加入联邦宇宙了吗？</h2>
              <p className="text-violet-100/80 max-w-md mx-auto text-[15px] leading-relaxed">
                注册任意 Mastodon 实例，即可连接到整个去中心化社交网络。
              </p>
              <div className="flex flex-wrap gap-3 justify-center pt-2">
                <LoginModal>
                  <Button size="lg" className="h-12 px-8 rounded-full font-medium bg-white text-violet-700 hover:bg-white/90 shadow-lg transition-all duration-200 hover:scale-[1.02]">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    立即登录
                  </Button>
                </LoginModal>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleGuestMode}
                  className="h-12 px-8 rounded-full font-medium border-white/30 text-white hover:bg-white/10 bg-transparent"
                >
                  访客浏览
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-black/5 dark:border-white/5 bg-[#f0f0f5]/60 dark:bg-[#060608]/60">
        <div className="mx-auto max-w-5xl px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
              <MessageCircle className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-medium">MastoClient</span>
          </div>
          <p className="text-xs text-muted-foreground">
            A better internet is possible.{" "}
            <span className="text-violet-500 dark:text-violet-400">Join the fediverse today.</span>
          </p>
          <p className="text-xs text-muted-foreground">Built with <Heart className="inline w-3 h-3 text-red-400" /> for the open web</p>
        </div>
      </footer>
    </div>
  )
}

