import nodemailer from 'nodemailer'

import { logger } from '@/lib/Logger'

import { verificationEmailTemplate } from './email-templates'

const mailConfig =
  process.env.NODE_ENV === 'production'
    ? {
        service: 'gmail',
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
        tls: {
          rejectUnauthorized: false,
        },
      }
    : {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: process.env.ETHEREAL_USER || 'ethereal.user@ethereal.email',
          pass: process.env.ETHEREAL_PASS || 'verysecret',
        },
      }

const transporter = nodemailer.createTransport(mailConfig)

type SendVerificationEmailParams = {
  name: string
  email: string
  code: string
}

export const sendVerificationEmail = async ({ name, email, code }: SendVerificationEmailParams) => {
  try {
    const info = await transporter.sendMail({
      from: `"Threads Clone" <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: `${code} is your confirmation code`,
      html: verificationEmailTemplate(name, email, code),
    })

    // Log Ethereal URL in development
    if (process.env.NODE_ENV !== 'production') {
      const previewUrl = nodemailer.getTestMessageUrl(info)
      logger.info(`Email preview URL: ${previewUrl}`)
    }
  } catch (error) {
    logger.error('Error sending email:', error)
    throw new Error('Failed to send verification email')
  }
}
