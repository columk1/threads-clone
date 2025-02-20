'use client'

import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { useCookies } from 'next-client-cookies'
import { useActionState, useEffect } from 'react'
import { toast } from 'sonner'

import AuthInput from '@/components/AuthInput'
import { VERIFIED_EMAIL_ALERT } from '@/lib/constants'
import { verifyEmailSchema } from '@/lib/schemas/zod.schema'
import { resendVerificationEmail, verifyEmail } from '@/services/auth/auth.actions'

const VerifyEmailForm = ({ userEmail }: { userEmail: string }) => {
  const [state, formAction, isPending] = useActionState(verifyEmail, null)
  const [resendState, resendFormAction, isResendPending] = useActionState(resendVerificationEmail, null)
  const cookies = useCookies()

  // Toast verified email status based on cookie
  useEffect(() => {
    const emailSent = cookies.get(VERIFIED_EMAIL_ALERT)
    if (emailSent) {
      toast(`We sent the confirmation code to your email ${userEmail}.`)
      cookies.remove(VERIFIED_EMAIL_ALERT)
    }
  }, [cookies, userEmail])

  // Toast resend status
  useEffect(() => {
    if (resendState?.success) {
      toast(`We sent the confirmation code to your email ${userEmail}.`)
    }
    if (resendState?.error) {
      toast(resendState.error)
    }
  }, [resendState?.error, resendState?.success, userEmail])

  const [form, fields] = useForm({
    id: 'verify-email-form',
    lastResult: state,
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: verifyEmailSchema,
      })
    },
    shouldValidate: 'onInput',
  })

  return (
    <>
      <div className="mb-4 text-center text-sm text-secondary-text">
        {`Enter the confirmation code we sent to ${userEmail}. `}
        <form action={resendFormAction} className="inline">
          <button type="submit" disabled={isPending || isResendPending} className="text-primary-text hover:underline">
            Resend code.
          </button>
        </form>
      </div>
      <form action={formAction} {...getFormProps(form)}>
        <div className="flex w-full flex-col gap-2 text-ms">
          <div className="flex flex-col gap-2">
            <AuthInput
              label="Confirmation Code"
              placeholder="Confirmation Code"
              defaultValue={state?.initialValue?.code?.toString()}
              error={fields.code.errors && fields.code.errors[0]}
              required
              className={`text-input ${!fields.code.valid ? 'text-red-500' : ''}`}
              {...getInputProps(fields.code, { type: 'text' })}
              key={fields.code.key}
            />
            <button
              type="submit"
              disabled={false || isPending}
              className="h-[3.25rem] w-full rounded-xl bg-primary-text font-semibold text-secondary-button disabled:text-placeholder-text"
            >
              Next
            </button>
          </div>
        </div>
      </form>
    </>
  )
}

export default VerifyEmailForm
