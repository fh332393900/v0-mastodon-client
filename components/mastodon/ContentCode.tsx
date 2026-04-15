'use client'

export default function ContentCode({
  code,
  lang,
}: {
  code: string
  lang?: string
}) {
  return (
    <pre className="overflow-x-auto bg-gray-100 p-3 rounded">
      <code>{decodeURIComponent(code)}</code>
    </pre>
  )
}