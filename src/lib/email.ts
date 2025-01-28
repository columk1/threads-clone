import nodemailer from 'nodemailer'

import { verificationEmailTemplate } from './email-templates'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true, // true for 465 port
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
})

type SendVerificationEmailParams = {
  name: string
  email: string
  code: string
}

export const sendVerificationEmail = async ({ name, email, code }: SendVerificationEmailParams) => {
  try {
    await transporter.sendMail({
      from: `"Threads Clone" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `${code} is your confirmation code`,
      html: verificationEmailTemplate(name, email, code),
    })
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Failed to send verification email')
  }
}
