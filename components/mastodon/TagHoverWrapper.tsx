'use client'

export default function TagHoverWrapper({
  tagName,
  children,
}: {
  tagName: string
  children: React.ReactNode
}) {
  return (
    <span
      title={`#${tagName}`}
      className="hover:underline cursor-pointer text-primary"
    >
      {children}
    </span>
  )
}