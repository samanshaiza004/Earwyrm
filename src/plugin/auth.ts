import { Elysia } from 'elysia'
import { bearer } from '@elysiajs/bearer'
import { jwt } from '@elysiajs/jwt'

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
      }),
    )
    .onBeforeHandle({ as: 'global' }, async (ctx) => {
      let isNeedLogin = true
      for (const excludePath of exclude) {
        if (ctx.path.includes(excludePath)) {
          isNeedLogin = false
          break
        }
      }
      if (isNeedLogin) {
        const profile = await ctx.jwt.verify(ctx.bearer)
        if (!profile) {
          ctx.set.status = 401
          return 'Unauthorized'
        }
      }
    })
