"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, Heart, Search, Settings, Menu, X, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth/auth-provider"

const navigationItems = [
  { icon: Home, label: "Home", route: "timeline", color: "text-blue-500" },
  { icon: Heart, label: "Favorites", route: "favorites", color: "text-red-500" },
  { icon: Search, label: "Explore", route: "explore", color: "text-green-500" },
  { icon: Settings, label: "Settings", route: "settings", color: "text-gray-500" },
]

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(true)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const server = pathname?.split("/")[1] || "mastodon.social"
  const baseHref = `/${server}`

  const handleLogout = async () => {
    await logout()
    window.location.href = "/"
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-card/80 backdrop-blur-sm"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={isMobileOpen ? "fixed inset-y-0 left-0 z-50 w-72 bg-card border-r border-border lg:relative lg:w-72" : "hidden lg:block lg:w-72 bg-card border-r border-border"}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            {!isCollapsed ? (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-lg font-bold">MastoClient</span>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
              </div>
            )}

            <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="hidden lg:flex">
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => {
              const href = `${baseHref}/${item.route}`
              const isActive = pathname === href
              return (
                <div key={item.route}>
                  <Link href={href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start transition-all duration-200 hover:scale-[1.02]",
                        isActive && "bg-accent text-accent-foreground shadow-sm",
                        isCollapsed && "px-2",
                      )}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      <item.icon
                        className={cn(
                          "h-5 w-5 transition-colors duration-200",
                          isActive ? item.color : "text-muted-foreground",
                          !isCollapsed && "mr-3",
                        )}
                      />
                      {!isCollapsed && <span className="font-medium">{item.label}</span>}
                    </Button>
                  </Link>
                </div>
              )
            })}
          </nav>

          {/* User Info */}
          {user && (
            <div className="p-4 border-t border-border">
              <div
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg bg-accent/50",
                  isCollapsed && "justify-center",
                )}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.displayName} />
                  <AvatarFallback>{user.displayName.charAt(0)}</AvatarFallback>
                </Avatar>

                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{user.displayName}</div>
                    <div className="text-xs text-muted-foreground truncate">@{user.username}</div>
                  </div>
                )}

                {!isCollapsed && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
