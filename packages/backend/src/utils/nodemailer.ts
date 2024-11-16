import nodemailer from 'nodemailer'
import type Mail from 'nodemailer/lib/mailer'

export function sendEmail(title: string, content: string, toMail: string) {
  const transporter = nodemailer.createTransport({
    service: 'Yahoo',
    host: 'smtp.mail.yahoo.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: process.env.NODEMAILER_AUTH_EMAIL!, // Your Yahoo email address
      pass: process.env.NODEMAILER_AUTH_PASS!, // Your Yahoo app password
    },
  })

  const mailOptions: Mail.Options = {
    from: { name: 'Earwyrm', address: process.env.NODEMAILER_AUTH_EMAIL! },
    to: toMail,
    subject: title,
    html: `<div>${content}</div>`,
  }

  return transporter.sendMail(mailOptions)
}
