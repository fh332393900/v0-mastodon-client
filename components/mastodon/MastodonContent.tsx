import { contentToReactNode } from '@/lib/mastodon/contentToReactNode'

export default function MastodonContent({
  content,
}: {
  content: string
}) {
  return (
    <div className="prose max-w-none break-words text-small content-rich">
      {contentToReactNode(content)}
    </div>
  )
}
