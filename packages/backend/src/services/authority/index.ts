import { Elysia, t } from 'elysia'

import { connection } from '../../collection/mysql'
import { redis } from '../../collection/redis'
import { auth } from '../../plugin/auth'
import { ignoreAuthPath } from '../../utils/configs'
import { sendEmail } from '../../utils/nodemailer'

export const authorityService = new Elysia()
  .use(auth({ exclude: ignoreAuthPath }))
  .post(
    '/authority/get_verification_code',
    async ({ body }) => {
      const { email } = body
      // Generate a 6-digit code and pad with zeros if needed
      const verificationCode = Math.floor(Math.random() * 1000000).toString().padStart(6, '0')
      
      try {
        // Store the code in Redis
        await redis.set(`verification:${email}`, verificationCode, 'EX', 300) // 5 minutes expiry
        
        // Send the email
        await sendEmail(
          'Verification email from Earwyrm',
          `Your verification code is: ${verificationCode}\n\nThis code will expire in 5 minutes.`,
          email
        )
        
        return {
          success: true,
          message: 'Verification code sent successfully. Please check your email.'
        }
      } catch (err) {
        console.error('Error in get_verification_code:', err)
        throw new Error('Failed to send verification code. Please try again.')
      }
    },
    {
      body: t.Object({ email: t.String() }),
    },
  )
  .post(
    '/authority/login',
    async ({ jwt, body, error }) => {
      const { email, verificationCode } = body
      console.log('[Login] Attempting login with:', { email, verificationCode });
      
      try {
        // Get the stored verification code
        const storedCode = await redis.get(`verification:${email}`)
        
        if (!storedCode) {
          console.log('[Login] No stored code found for email:', email);
          return error(400, 'Verification code expired or not found. Please request a new code.')
        }

        // Compare the codes as strings
        if (verificationCode === storedCode) {
          console.log('[Login] Verification code matched');
          // Delete the used verification code
          await redis.del(`verification:${email}`)
          
          // Create or update the user
          const user = await connection.user.upsert({
            where: { email },
            update: { email },
            create: { 
              email,
              name: `user_${String(Date.now())}`,
              username: `user_${String(Date.now())}`,
              passwordHash: '' // We're using email verification, so no password needed
            },
          })

          console.log('[Login] User upserted:', user);

          // Generate JWT token with the correct payload structure
          const payload = { 
            email: user.email,
            sub: String(user.id),
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours expiration
          };
          console.log('[Login] Token payload:', payload);

          const token = await jwt.sign(payload);
          console.log('[Login] Generated token:', token);

          const response = { 
            success: true,
            data: { token }
          };
          console.log('[Login] Full response:', response);

          return response;
        } else {
          console.log('[Login] Invalid verification code');
          return error(400, 'Invalid verification code. Please try again.')
        }
      } catch (err) {
        console.error('Error in login:', err)
        return error(500, 'An error occurred during login. Please try again.')
      }
    },
    {
      body: t.Object({
        verificationCode: t.String(),
        email: t.String()
      }),
    },
  )
  .post(
    '/authority/logout',
    async ({ cookie: { auth } }) => {
      auth.remove()
      return { success: true }
    }
  )
