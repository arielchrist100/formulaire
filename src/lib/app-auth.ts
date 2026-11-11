import 'server-only'

import config from '@payload-config'
import { cookies } from 'next/headers'
import { getPayload, type AuthCollectionSlug } from 'payload'

const SESSION_COOKIE = 'app-session'

const cookieOptions = (maxAge?: number) => ({
  httpOnly: true,
  maxAge,
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
})

export function createAppAuth<TCollection extends AuthCollectionSlug>(
  appUserCollection: TCollection,
) {
  return {
    async currentUser() {
      const token = (await cookies()).get(SESSION_COOKIE)?.value
      if (!token) return null

      const payload = await getPayload({ config })
      const authHeaders = new Headers({ Authorization: `JWT ${token}` })
      const { user } = await payload.auth({ headers: authHeaders })

      if (!user || user.collection !== appUserCollection) return null
      return user
    },

    async login(email: string, password: string) {
      const payload = await getPayload({ config })
      const result = await payload.login({
        collection: appUserCollection,
        data: { email, password },
        overrideAccess: false,
      })

      if (!result.token || !result.user || result.user.collection !== appUserCollection) {
        throw new Error('Unable to establish the application session.')
      }

      const maxAge = result.exp
        ? Math.max(0, result.exp - Math.floor(Date.now() / 1000))
        : 7 * 24 * 60 * 60

      ;(await cookies()).set(SESSION_COOKIE, result.token, cookieOptions(maxAge))
      return result.user
    },

    async logout() {
      ;(await cookies()).set(SESSION_COOKIE, '', cookieOptions(0))
    },
  }
}

export const appAuth = createAppAuth('users')
