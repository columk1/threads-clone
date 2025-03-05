'use client'

import { useCookies } from 'next-client-cookies'
import { useEffect } from 'react'
import { toast } from 'sonner'

type CookieToastProps = {
  cookieName: string
  message: string
}

/**
 * Shows a toast message based on the presence of a cookie and then removes the cookie
 */
export const CookieToast = ({ cookieName, message }: CookieToastProps): null => {
  const cookies = useCookies()

  useEffect(() => {
    const cookieValue = cookies.get(cookieName)
    if (cookieValue) {
      toast(message)
      cookies.remove(cookieName)
    }
  }, [cookies, cookieName, message])

  return null
}
