"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Server,
  Zap,
  Volume2,
  Eye,
  Lock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

export default function SettingsPage() {
  const [serverUrl, setServerUrl] = useState("")
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle")
  const [isConnected, setIsConnected] = useState(false)
  const [settings, setSettings] = useState({
    displayName: "",
    bio: "",
    animations: true,
    pushNotifications: true,
    emailNotifications: false,
    privateAccount: false,
    hideSensitive: true,
    autoplayMedia: true,
    reduceMotion: false,
    fontSize: [16],
    timelineRefresh: [30],
    language: "en",
    dateFormat: "relative",
  })

  const handleConnect = async () => {
    if (!serverUrl) return

    setIsConnecting(true)
    setConnectionStatus("idle")

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setIsConnected(true)
      setConnectionStatus("success")
    } catch (error) {
      setConnectionStatus("error")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setConnectionStatus("idle")
  }

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6 px-4 py-6">
      <div className="flex items-center space-x-3 border-b border-border pb-4">
        <Settings className="w-8 h-8 text-gray-500" />
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-primary" />
              <span>Server Connection</span>
            </CardTitle>
            <CardDescription>Connect to your Mastodon instance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isConnected ? (
              <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Connected</p>
                    <p className="text-sm text-muted-foreground">{serverUrl}</p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="server-url">Mastodon Server URL</Label>
                  <Input
                    id="server-url"
                    type="url"
                    placeholder="https://mastodon.social"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)}
                  />
                </div>

                {connectionStatus === "error" && (
                  <div className="flex items-center space-x-2 text-destructive">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Failed to connect to server</span>
                  </div>
                )}

                <Button onClick={handleConnect} disabled={!serverUrl || isConnecting} className="w-full">
                  {isConnecting ? "Connecting..." : "Connect to Server"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-primary" />
              <span>Account</span>
            </CardTitle>
            <CardDescription>Manage your account settings and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display-name">Display Name</Label>
              <Input
                id="display-name"
                placeholder="Your display name"
                value={settings.displayName}
                onChange={(e) => updateSetting("displayName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Input
                id="bio"
                placeholder="Tell us about yourself"
                value={settings.bio}
                onChange={(e) => updateSetting("bio", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5 text-secondary" />
              <span>Appearance</span>
            </CardTitle>
            <CardDescription>Customize the look and feel of your client</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
              </div>
              <ThemeToggle />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Animations</Label>
                <p className="text-sm text-muted-foreground">Enable rich animations and transitions</p>
              </div>
                <Switch checked={settings.animations} onCheckedChange={(value: boolean) => updateSetting("animations", value)} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Font Size</Label>
                <Slider value={settings.fontSize} onValueChange={(value: number[]) => updateSetting("fontSize", value)} max={24} min={14} step={1} />
              </div>
              <div className="space-y-2">
                <Label>Timeline refresh</Label>
                <Slider value={settings.timelineRefresh} onValueChange={(value: number[]) => updateSetting("timelineRefresh", value)} max={60} min={10} step={5} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select value={settings.language} onValueChange={(value: string) => updateSetting("language", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date Format</Label>
                <Select value={settings.dateFormat} onValueChange={(value: string) => updateSetting("dateFormat", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Date Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relative">Relative</SelectItem>
                    <SelectItem value="absolute">Absolute</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
