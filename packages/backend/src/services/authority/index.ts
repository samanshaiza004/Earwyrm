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
      await sendEmail('test', 'The login verification code for this time is' + randomCode, email)
      return 'The verification code was successfully obtained, please check it in your mailbox.'
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
        return error(400, 'Please get a verification code first.')
      }
      if (randomCode === preRandomCode) {
        await connection.user.upsert({
          where: { email },
          update: { email },
          create: { email, name: `用户${randomCode}` },
        })
        return await jwt.sign({ email })
      } else {
        return error(
          400,
          'The verification code is incorrect, please check your email verification code, or get it again after 60s.',
        )
      }
    },
    {
      body: t.Object({ randomCode: t.String(), email: t.String() }),
    },
  )
