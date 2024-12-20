'use client'

import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { useCookies } from 'next-client-cookies'
import { useEffect } from 'react'
import { useFormState } from 'react-dom'
import { toast } from 'sonner'

import { resendVerificationEmail, verifyEmail } from '@/app/actions'
import AuthInput from '@/components/AuthInput'
import { VERIFIED_EMAIL_ALERT } from '@/libs/constants'
import { verifyEmailSchema } from '@/models/zod.schema'

const VerifyEmailForm = ({ userEmail }: { userEmail: string }) => {
  const [lastResult, action] = useFormState(verifyEmail, undefined)
  const [resendState, resendAction] = useFormState(resendVerificationEmail, null)
  const cookies = useCookies()

  useEffect(() => {
    if (resendState?.success) {
      // toast("Email sent!");
      toast(`We sent the confirmation code to your email ${userEmail}.`)
    }
    if (resendState?.error) {
      // toast(resendState.error, {
      //   icon: <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />,
      // });
      toast(resendState.error)
    }
  }, [resendState?.error, resendState?.success, userEmail])

  useEffect(() => {
    const emailSent = cookies.get(VERIFIED_EMAIL_ALERT)
    if (emailSent) {
      toast(`We sent the confirmation code to your email ${userEmail}.`)
    }
  }, [cookies, userEmail])

  const [form, fields] = useForm({
    id: 'verify-email-form',
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: verifyEmailSchema,
      })
    },
    shouldValidate: 'onInput',
  })

  return (
    <>
      <div className="mb-4 text-center text-sm text-gray-7">
        {`Enter the confirmation code we sent to ${userEmail}. `}
        <form action={resendAction} className="inline">
          <button type="submit" className="text-primary-text hover:underline">
            Resend code.
          </button>
        </form>
      </div>
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
    </>
  )
}

export default VerifyEmailForm
