import { Env } from '@/lib/Env'

export const VERIFIED_EMAIL_ALERT = 'VERIFIED_EMAIL_ALERT'
export const EMAIL_VERIFICATION_MAX_AGE = 5 * 60 // 5 minutes

export const REPORTED_CONFIRMATION_MESSAGE = 'Thanks for your feedback. Our team will review this soon.'

export const IMG_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${Env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`

export const MAX_CHARACTERS = 500
export const BIO_CHARACTER_LIMIT = 150

// URL regex pattern that matches URLs starting with http://, https://, or www.
export const URL_PATTERN = /(https?:\/\/\S+)|(www\.\S+)/g
