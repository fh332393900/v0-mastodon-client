import { kv } from '@vercel/kv'

export async function kvTest() {
  await kv.set('test', 1111)
}