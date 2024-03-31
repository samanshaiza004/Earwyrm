import { Elysia, t } from 'elysia'
import { connection } from './collection/mysql'
import { redis } from './collection/redis'
import { jwt } from '@elysiajs/jwt'
import { sendEmail } from './utils/nodemailer'
import { tracerFn } from './record'

const app = new Elysia()
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRETS!,
      exp: '7d',
    }),
  )
  .post(
    '/authority/login',
    async ({ jwt, cookie: { auth }, body }) => {
      const { email, randomCode } = body
      const preRandomCode = await redis.get(email)
      if (preRandomCode) {
        if (randomCode === preRandomCode) {
          await connection.user.upsert({
            where: { email },
            update: { email },
            create: { email, name: `用户${randomCode}` },
          })
          const token = await jwt.sign({ email })
          auth.set({
            value: token,
            httpOnly: true,
            maxAge: 7 * 86400,
            path: '/',
          })
          return { data: token }
        } else {
          throw new Error('验证码错误,请60s后重新获取。')
        }
      } else {
        /** 这里逻辑前端需要限制用户需要先点击获取验证码操作 不能在未点击获取验证码按钮的情况下调用这个接口 **/
        const randomCode = (Math.random() * 1000000).toFixed(0)
        redis.set(email, randomCode, 'EX', 60)
        await sendEmail('test', '本次登录验证码是' + randomCode, email)
        return { data: { randomCode }, message: '获取验证码成功' }
      }
    },
    {
      body: t.Object({ randomCode: t.String(), email: t.String() }),
    },
  )
  .get('/user', async (ctx) => {
    const profile = await ctx.jwt.verify(ctx.cookie.auth.value)
    if (!profile) {
      ctx.set.status = 401
      return 'Unauthorized'
    }
    async function apiFun() {
      return {
        data: await connection.user.findMany(),
        message: '获取所有用户成功',
      }
    }
    return tracerFn(ctx, apiFun, 'GET /user')
  })

app.listen(8090)
