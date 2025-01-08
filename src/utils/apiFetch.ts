import { cookies } from 'next/headers'

import { getBaseUrl } from './getBaseUrl'

// import type { ResponseData } from '@/app/api/posts/[postId]/route'

type FetchOptions = RequestInit & {
  headers?: Record<string, string>
}

export const apiFetch = async (endpoint: string, options: FetchOptions = {}) => {
  const cookieStore = await cookies()
  const authCookie = cookieStore.get('user_session')
  const cookieHeader = `${authCookie?.name}=${authCookie?.value}`

  const headers = {
    ...options.headers,
    ...(authCookie ? { Cookie: cookieHeader } : {}),
  }

  const baseUrl = getBaseUrl()

  const response = await fetch(`${baseUrl}/api/${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Ensure credentials are included
  })

  if (!response.ok) {
    throw new Error(`Fetch failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// const data: ResponseData = await fetch(`${BASE_URL}/api/posts/${postId}?user=${currentUser?.id}&replies=true`, {
//   cache: 'force-cache',
//   next: { revalidate: 60 },
//   headers: {
//     Cookie: `${authCookie?.name}=${authCookie?.value}`,
//   },
// }).then(res => res.json())
