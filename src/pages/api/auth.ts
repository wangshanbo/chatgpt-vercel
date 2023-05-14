import type { APIRoute } from 'astro'
import phoneList from '@/utils/phoneList'

export const post: APIRoute = async (context) => {
  const body = await context.request.json()

  const { pass } = body
  // 判断pass是否在phoneList中
  const isPhone = phoneList.some((item) => item == pass)
  
  return new Response(JSON.stringify({
    code: isPhone ? 0 : -1,
  }))
}
