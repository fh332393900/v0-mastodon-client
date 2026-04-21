"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useComposeSearch } from "@/hooks/mastodon/useComposeSearch"
import type { mastodon } from "masto"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getDisplayNameText, renderDisplayName } from "@/lib/mastodon/contentToReactNode"

type TriggerType = "hashtags" | "accounts"

type TriggerState = {
  type: TriggerType
  query: string
  start: number
  end: number
}

export type ComposeEditorHandle = {
  insertText: (text: string) => void
  focus: () => void
}

type ComposeEditorProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  onLengthChange?: (length: number) => void
  editorRef?: React.RefObject<ComposeEditorHandle | null>
}

function getCaretIndex(root: HTMLElement) {
  const selection = window.getSelection()
  if (!selection || selection.rangeCount === 0) return 0
  const range = selection.getRangeAt(0)
  const preRange = range.cloneRange()
  preRange.selectNodeContents(root)
  preRange.setEnd(range.endContainer, range.endOffset)
  return preRange.toString().length
}

function getRangeForTextIndices(root: HTMLElement, start: number, end: number) {
  const range = document.createRange()
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null)
  let currentIndex = 0
  let startNode: Text | null = null
  let startOffset = 0
  let endNode: Text | null = null
  let endOffset = 0

  while (walker.nextNode()) {
    const node = walker.currentNode as Text
    const nextIndex = currentIndex + node.data.length

    if (!startNode && start <= nextIndex) {
      startNode = node
      startOffset = Math.max(0, start - currentIndex)
    }

    if (end <= nextIndex) {
      endNode = node
      endOffset = Math.max(0, end - currentIndex)
      break
    }

    currentIndex = nextIndex
  }

  if (!startNode || !endNode) {
    range.selectNodeContents(root)
    range.collapse(false)
    return range
  }

  range.setStart(startNode, startOffset)
  range.setEnd(endNode, endOffset)
  return range
}

export function ComposeEditor({
  value,
  onChange,
  placeholder = "说点什么吧…",
  className,
  onLengthChange,
  editorRef,
}: ComposeEditorProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [trigger, setTrigger] = useState<TriggerState | null>(null)

  const { isLoading, accounts, hashtags } = useComposeSearch(
    trigger?.query ?? "",
    trigger?.type ?? null,
  )

  useEffect(() => {
    if (!rootRef.current) return
    if (value === "") {
      rootRef.current.innerHTML = ""
    }
  }, [value])

  useEffect(() => {
    if (!editorRef) return
    editorRef.current = {
      insertText: (text: string) => {
        const root = rootRef.current
        if (!root) return
        const selection = window.getSelection()
        if (!selection || selection.rangeCount === 0) {
          root.focus()
          return
        }
        const range = selection.getRangeAt(0)
        range.deleteContents()
        const node = document.createTextNode(text)
        range.insertNode(node)
        range.setStartAfter(node)
        range.setEndAfter(node)
        selection.removeAllRanges()
        selection.addRange(range)
        handleInput()
      },
      focus: () => rootRef.current?.focus(),
    }
  }, [editorRef])

  const handleInput = () => {
    const root = rootRef.current
    if (!root) return
    const text = root.textContent ?? ""
    onChange(text)
    onLengthChange?.(text.length)

    const caretIndex = getCaretIndex(root)
    const textBefore = text.slice(0, caretIndex)
    const match = textBefore.match(/(^|\s)([#@])([\p{L}\p{N}_-]{1,30})$/u)

    if (!match) {
      setTrigger(null)
      return
    }

    const symbol = match[2]
    const queryText = match[3]
    const start = caretIndex - (symbol.length + queryText.length)

    setTrigger({
      type: symbol === "#" ? "hashtags" : "accounts",
      query: queryText,
      start,
      end: caretIndex,
    })
  }

  const insertEntity = (label: string, type: TriggerType) => {
    const root = rootRef.current
    if (!root || !trigger) return

    const replacement = type === "hashtags" ? `#${label}` : `@${label}`
    const range = getRangeForTextIndices(root, trigger.start, trigger.end)
    range.deleteContents()

    const span = document.createElement("span")
    span.textContent = replacement
    span.setAttribute("data-entity", type)
    span.className = "text-primary font-semibold"
    span.contentEditable = "false"

    range.insertNode(span)
    const space = document.createTextNode(" ")
    range.setStartAfter(span)
    range.insertNode(space)
    range.setStartAfter(space)
    range.setEndAfter(space)

    const selection = window.getSelection()
    selection?.removeAllRanges()
    selection?.addRange(range)

    setTrigger(null)
    handleInput()
  }

  const renderAccount = (account: mastodon.v1.Account) => {
    const nameText = getDisplayNameText({
      displayName: account.displayName,
      username: account.username,
    })

    return (
      <button
        key={account.id}
        type="button"
        onClick={() => insertEntity(account.acct, "accounts")}
        className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={account.avatar} alt={nameText} />
          <AvatarFallback>{nameText.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="truncate font-medium text-foreground">
            {renderDisplayName({
              displayName: account.displayName,
              username: account.username,
              emojis: account.emojis,
            })}
          </div>
          <div className="truncate text-xs text-muted-foreground">@{account.acct}</div>
        </div>
      </button>
    )
  }

  const renderHashtag = (tag: mastodon.v1.Tag) => (
    <button
      key={tag.name}
      type="button"
      onClick={() => insertEntity(tag.name, "hashtags")}
      className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm hover:bg-muted"
    >
      <span className="font-medium text-foreground">#{tag.name}</span>
      {tag.history?.[0]?.uses ? (
        <span className="text-xs text-muted-foreground">{tag.history[0].uses} 次</span>
      ) : null}
    </button>
  )

  const showPopover = !!trigger && (isLoading || accounts.length > 0 || hashtags.length > 0)

  const popoverContent = useMemo(() => {
    if (!trigger) return null
    if (isLoading) {
      return (
        <div className="space-y-2 p-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
          <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      )
    }

    if (trigger.type === "accounts") {
      return (
        <div className="space-y-1 p-1">
          {accounts.length === 0 ? (
            <div className="px-2 py-2 text-xs text-muted-foreground">没有匹配用户</div>
          ) : (
            accounts.map(renderAccount)
          )}
        </div>
      )
    }

    return (
      <div className="space-y-1 p-1">
        {hashtags.length === 0 ? (
          <div className="px-2 py-2 text-xs text-muted-foreground">没有匹配话题</div>
        ) : (
          hashtags.map(renderHashtag)
        )}
      </div>
    )
  }, [accounts, hashtags, isLoading, trigger])

  return (
    <Popover open={showPopover} onOpenChange={(open) => !open && setTrigger(null)}>
      <PopoverTrigger asChild>
        <div
          ref={rootRef}
          role="textbox"
          aria-label="编辑器"
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          className={cn(
            "min-h-[160px] w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-sm outline-none focus:outline-none focus:ring-0",
            "focus:outline-none focus:ring-2 focus:ring-primary/40",
            "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground",
            "empty:before:pointer-events-none",
            className,
          )}
          onInput={handleInput}
          onKeyUp={handleInput}
        />
      </PopoverTrigger>
      <PopoverContent align="start" side="bottom" className="w-80">
        {popoverContent}
      </PopoverContent>
    </Popover>
  )
}
