import { Google } from 'arctic'

import { getBaseUrl } from '@/utils/getBaseUrl'

import { Env } from './Env'

export const google = new Google(
  Env.GOOGLE_CLIENT_ID ?? '',
  Env.GOOGLE_CLIENT_SECRET ?? '',
  `${getBaseUrl()}/api/login/google/callback`,
)
