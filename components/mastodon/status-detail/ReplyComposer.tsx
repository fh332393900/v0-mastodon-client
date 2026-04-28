"use client"

import type { RefObject } from "react"
import type { mastodon } from "masto"

import { ComposeEditor, type ComposeEditorHandle } from "@/components/mastodon/compose-editor"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { LoginModal } from "@/components/auth/login-modal"
import { getDisplayNameText } from "@/lib/mastodon/contentToReactNode"
import { useTranslations } from "next-intl"

export function ReplyComposer({
  user,
  fallbackAuthor,
  value,
  onChange,
  onSubmit,
  isSubmitting,
  isAuthenticated,
  isLoginOpen,
  onLoginOpenChange,
  editorRef,
}: {
  user: mastodon.v1.AccountCredentials | null
  fallbackAuthor: mastodon.v1.Account
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isSubmitting: boolean
  isAuthenticated: boolean
  isLoginOpen: boolean
  onLoginOpenChange: (open: boolean) => void
  editorRef: RefObject<ComposeEditorHandle | null>
}) {
  const authorNameText = getDisplayNameText({
    displayName: user?.displayName ?? fallbackAuthor.displayName,
    username: user?.username ?? fallbackAuthor.username,
  })
  const t = useTranslations()

  return (
    <div className="rounded-3xl border border-border/60 bg-card/90 p-4">
      <LoginModal open={isLoginOpen} onOpenChange={onLoginOpenChange} />
      <div className="flex gap-4">
        <Avatar className="h-11 w-11">
          <AvatarImage src={user?.avatar ?? fallbackAuthor.avatar} alt={authorNameText} />
          <AvatarFallback>{authorNameText.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3">
          <ComposeEditor
            value={value}
            onChange={onChange}
            placeholder={isAuthenticated ? t("account.writeReply") : t("account.loginToReply")}
            className="min-h-[120px]"
            editorRef={editorRef}
          />
          <div className="flex justify-end">
            <Button onClick={onSubmit} disabled={isSubmitting || !value.trim()}>
              {isSubmitting ? t("account.sending") : t("account.postReply")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
