export const BASE_URL
= process.env.NODE_ENV === 'production'
  ? process.env.PUBLIC_URL
  : 'http://localhost:3000'
