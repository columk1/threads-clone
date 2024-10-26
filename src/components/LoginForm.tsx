'use client'

import { useActionState } from 'react'

import { login } from '@/app/actions'

import AuthInput from './AuthInput'
import FacebookAuthButton from './FacebookAuthButton'

const LoginForm = () => {
  const [state, formAction, isPending] = useActionState(login, null)

  return (
    <form action={formAction} autoComplete="off">
      <div className="flex w-full flex-col gap-2 text-[15px]">
        <div className="flex flex-col gap-2">
          <AuthInput
            type="text"
            name="email"
            label="Username, phone or email"
            placeholder="Username, phone or email"
            autoComplete="current-email"
            defaultValue={state?.initialValue?.email?.toString()}
            error={state?.error?.email && state?.error?.email[0]}
            className="text-input h-[3.25rem] rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light selection:bg-[#3b587c] placeholder:text-placeholder-text focus:border focus:border-primary-outline focus:outline-0"
          />
          <AuthInput
            type="password"
            name="password"
            label="Password"
            placeholder="Password"
            autoComplete="current-password"
            defaultValue={state?.initialValue?.password?.toString()}
            error={state?.error?.password && state?.error?.password[0]}
            className="text-input h-[3.25rem] rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light selection:bg-[#3b587c] placeholder:text-placeholder-text focus:border focus:border-primary-outline focus:outline-0"
          />
        </div>
        <div className="flex flex-col gap-4">
          <button type="submit" disabled={isPending}className="h-[3.25rem] w-full rounded-xl bg-primary-text font-semibold text-secondary-button">
            Log in
          </button>
          <div className="text-center">
            <a href="forgot-password" className="text-sm text-gray-text hover:underline">
              Forgot password?
            </a>
          </div>
          <div className="flex items-center justify-center space-x-4 text-gray-text">
            <hr className="w-full border-[0.5px] border-primary-outline" />
            <span className="px-4">or</span>
            <hr className="w-full border-t border-primary-outline" />
          </div>
          <FacebookAuthButton>Continue with Facebook</FacebookAuthButton>
        </div>
      </div>
    </form>
  )
}

export default LoginForm
