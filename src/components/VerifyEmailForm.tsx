'use client'

import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { useFormState } from 'react-dom'

import { verifyEmail } from '@/app/actions'
import AuthInput from '@/components/AuthInput'
import Toast from '@/components/Toast'
import { verifyEmailSchema } from '@/models/zod.schema'

const VerifyEmailForm = () => {
  const [lastResult, action] = useFormState(verifyEmail, undefined)

  const [form, fields] = useForm({
    id: 'verify-email-form',
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: verifyEmailSchema,
      })
    },
    shouldValidate: 'onBlur',
  })

  return (
    <>
      <form action={action} {...getFormProps(form)}>
        <div className="flex w-full flex-col gap-2 text-[15px]">
          <div className="flex flex-col gap-2">
            <AuthInput
              label="Confirmation Code"
              placeholder="Confirmation Code"
              error={fields.code.errors && fields.code.errors[0]}
              required
              className={`text-gray-500 ${
                !fields.code.valid ? 'text-red-500' : ''
              }`}
              {...getInputProps(fields.code, { type: 'text' })}
              key={fields.code.key}
            />
            <button type="submit" disabled={false} className="h-[3.25rem] w-full rounded-xl bg-primary-text font-semibold text-secondary-button disabled:text-placeholder-text">
              Next
            </button>
          </div>
        </div>
      </form>
      <Toast message="Enter 6-digit OTP logged to console." />
    </>
  )
}

export default VerifyEmailForm
