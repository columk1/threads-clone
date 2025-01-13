/*
 * Is Unique Email (called from client)
 */

import { getBaseUrl } from '@/utils/getBaseUrl'

export const isUniqueEmail = async (email: string) =>
  await fetch(`${getBaseUrl()}/api/users/validate?email=${encodeURIComponent(email)}`).then((res) => res.ok)

/*
 * Is Unique Email (called from client)
 */

export const isUniqueUsername = async (username: string) =>
  await fetch(`${getBaseUrl()}/api/users/validate?username=${encodeURIComponent(username)}`).then((res) => res.ok)
