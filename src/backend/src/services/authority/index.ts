import { Elysia, t } from 'elysia'
import { redis } from '../../collection/redis'
import { connection } from '../../collection/mysql'
import { sendEmail } from '../../utils/nodemailer'
import { auth } from '../../plugin/auth'

export const authorityService = new Elysia().use(auth({ exclude: ['/authority/login'] })).post(
  '/authority/login',
  async ({ jwt, body }) => {
    const { email, randomCode } = body
    const preRandomCode = await redis.get(email)
    if (preRandomCode) {
      if (randomCode === preRandomCode) {
        await connection.user.upsert({
          where: { email },
          update: { email },
          create: { email, name: `用户${randomCode}` },
        })
        return await jwt.sign({ email })
      } else {
        throw new Error('验证码错误,请60s后重新获取。')
      }
    } else {
      /** 这里逻辑前端需要限制用户需要先点击获取验证码操作 不能在未点击获取验证码按钮的情况下调用这个接口 **/
      const randomCode = (Math.random() * 1000000).toFixed(0)
      redis.set(email, randomCode, 'EX', 60)
      await sendEmail('test', '本次登录验证码是' + randomCode, email)
      return '获取验证码成功，请到你的邮箱查看。'
    }
  },
  {
    body: t.Object({ randomCode: t.Optional(t.String()), email: t.String() }),
  },
)
