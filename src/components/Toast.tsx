'use client'

import { useCookies } from 'next-client-cookies'
import { useEffect } from 'react'

import { VERIFIED_EMAIL_ALERT } from '@/lib/constants'

const Toast = ({ message }: { message: string }) => {
  const cookies = useCookies()

  useEffect(() => {
    const toast = cookies.get(VERIFIED_EMAIL_ALERT)
    if (toast) {
      // eslint-disable-next-line no-alert
      alert(message)
      cookies.remove(VERIFIED_EMAIL_ALERT)
    }
  }, [cookies, message])

  return null
}

export default Toast
