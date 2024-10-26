'use client'

import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import Link from 'next/link'
import { useFormState } from 'react-dom'

import { login } from '@/app/actions'
import { loginSchema } from '@/models/zod.schema'

const ResendOTPForm = () => {
  const [lastResult, action] = useFormState(login, undefined)

  const [form, fields] = useForm({
    id: 'resend-otp-form',
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: loginSchema,
      })
    },
    shouldValidate: 'onBlur',
  })

  return (
    <>
      <Link href="/" className="hover:underline">
        go home
      </Link>
      <form action={action} {...getFormProps(form)}>
        <input
          className={!fields.email.valid ? 'text-red-500' : ''}
          {...getInputProps(fields.email, { type: 'email' })}
          key={fields.email.key}
        />
        <div className="text-red-500">{fields.email.errors}</div>
        <button type="submit" name="intent" value="resend">
          resend otp
        </button>
      </form>
    </>
  )
}

export default ResendOTPForm
