import { Elysia, t } from 'elysia'
import { redis } from '../../collection/redis'
import { connection } from '../../collection/mysql'
import { sendEmail } from '../../utils/nodemailer'
import { auth } from '../../plugin/auth'
import { ignoreAuthPath } from '../../utils/configs'

export const authorityService = new Elysia()
  .use(auth({ exclude: ignoreAuthPath }))
  .post(
    '/authority/get_verification_code',
    async ({ body }) => {
      const { email } = body
      const randomCode = (Math.random() * 1000000).toFixed(0)
      redis.set(email, randomCode, 'EX', 60)
      await sendEmail('test', '本次登录验证码是' + randomCode, email)
      return '获取验证码成功，请到你的邮箱查看。'
    },
    {
      body: t.Object({ email: t.String() }),
    },
  )
  .post(
    '/authority/login',
    async ({ jwt, body, error }) => {
      const { email, randomCode } = body
      const preRandomCode = await redis.get(email)
      if (!preRandomCode) {
        return error(400, '请先获取验证码')
      }
      if (randomCode === preRandomCode) {
        await connection.user.upsert({
          where: { email },
          update: { email },
          create: { email, name: `用户${randomCode}` },
        })
        return await jwt.sign({ email })
      } else {
        return error(400, '验证码错误,请核对你的邮箱验证码，或者60s后重新获取。')
      }
    },
    {
      body: t.Object({ randomCode: t.String(), email: t.String() }),
    },
  )
