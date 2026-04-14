import { redirect } from "next/navigation"

export default function ServerIndexPage({ params }: { params: { server: string } }) {
  redirect(`/${params.server}/timeline`)
}
