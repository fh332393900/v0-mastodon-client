'use client'

import TagHoverPopover from '@/components/mastodon/TagHoverPopover'

export default function TagHoverWrapper({
  tagName,
  children,
}: {
  tagName: string
  children: React.ReactNode
}) {
  return (
    <TagHoverPopover tagName={tagName}>
      {children}
    </TagHoverPopover>
  )
}