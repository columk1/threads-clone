export const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' || process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview') {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }
  return 'http://localhost:3000'
}
