'use client'

export default function AccountHoverWrapper({
  handle,
  children,
}: {
  handle: string
  children: React.ReactNode
}) {
  return (
    <span
      title={handle}
      className="hover:underline cursor-pointer text-blue-500"
    >
      {children}
    </span>
  )
}
