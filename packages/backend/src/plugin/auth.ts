import { bearer } from '@elysiajs/bearer'
import { jwt } from '@elysiajs/jwt'
import { Elysia } from 'elysia'

import { connection } from '../collection/mysql'

interface AuthOptions {
  exclude: string[]
}

export const auth = ({ exclude }: AuthOptions) =>
  new Elysia({ name: 'auth' })
    .use(bearer())
    .use(
      jwt({
        name: 'jwt',
        secret: process.env.JWT_SECRETS!,
        exp: '24h'
      }),
    )
    .onBeforeHandle({ as: 'global' }, async (ctx) => {
      console.log('[Auth] Request path:', ctx.path);
      console.log('[Auth] Bearer token:', ctx.bearer);
      
      let isNeedLogin = true
      for (const excludePath of exclude) {
        if (ctx.path.includes(excludePath)) {
          console.log('[Auth] Path excluded from authentication:', ctx.path);
          isNeedLogin = false
          break
        }
      }
      
      if (isNeedLogin && ctx.bearer) {
        console.log('[Auth] Verifying JWT token...');
        try {
          const profile = await ctx.jwt.verify(ctx.bearer)
          console.log('[Auth] JWT verification result:', profile);
          
          if (!profile || typeof profile !== 'object' || !('email' in profile)) {
            console.log('[Auth] Authentication failed: Invalid token payload');
            return ctx.error(401)
          }
        } catch (error) {
          console.error('[Auth] Token verification error:', error);
          return ctx.error(401)
        }
      } else if (isNeedLogin) {
        console.log('[Auth] No bearer token provided');
        return ctx.error(401)
      }
    })
    .derive({ as: 'global' }, async ({ bearer, jwt }) => {
      if (!bearer) {
        console.log('[Auth] No bearer token in derive middleware');
        return {}
      }

      try {
        console.log('[Auth] Attempting to verify token and get user info');
        const tokenPayload = await jwt.verify(bearer)
        console.log('[Auth] Token payload:', tokenPayload);
        
        if (!tokenPayload || typeof tokenPayload !== 'object' || !('email' in tokenPayload)) {
          console.log('[Auth] Invalid token payload format');
          return {}
        }

        const email = tokenPayload.email
        if (email && typeof email === 'string') {
          const userInfo = await connection.user.findUnique({ where: { email } })
          console.log('[Auth] User info retrieved:', userInfo ? 'Success' : 'Not found');
          return { userInfo }
        } else {
          console.log('[Auth] Invalid email in token payload');
          return {}
        }
      } catch (error) {
        console.error('[Auth] Error in derive middleware:', error);
        return {}
      }
    })
