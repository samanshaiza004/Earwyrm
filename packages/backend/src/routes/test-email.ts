import { Elysia } from 'elysia';
import { sendEmail } from '../utils/nodemailer';

export const testEmail = new Elysia({ prefix: '/api' })
  .get('/test-email', async () => {
    try {
      await sendEmail(
        'Test Email from Earwyrm',
        'This is a test email to verify the nodemailer setup is working correctly.',
        process.env.NODEMAILER_AUTH_EMAIL! // sending to yourself as a test
      );
      return { success: true, message: 'Test email sent successfully' };
    } catch (error: any) {
      console.error('Email error:', error);
      return { success: false, error: error.message };
    }
  });
