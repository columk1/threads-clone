'use client'

import { useActionState, useCallback, useRef, useState } from 'react'

import { login } from '@/app/actions'
import Spinner from '@/components/Spinner/Spinner'

import AuthInput from './AuthInput'
import FacebookAuthButton from './FacebookAuthButton'

const LoginForm = () => {
  const [state, formAction, isPending] = useActionState(login, null)
  const [isValid, setIsValid] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)

  const getValidity = useCallback(() => formRef?.current?.email?.value !== '' && formRef?.current?.password?.value !== '', [])

  const handleInput = useCallback(() => {
    if (isValid !== getValidity()) {
      setIsValid(!isValid)
    }
  }, [isValid, getValidity])

  return (
    <form ref={formRef} onInput={handleInput} action={formAction} autoComplete="off">
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
            // key forces a re-render if state receives the same error on subsequent submissions
            key={`${state?.initialValue?.email}${state?.initialValue?.password}`}
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
          <button type="submit" disabled={!isValid && !isPending} className="flex h-[3.25rem] w-full items-center justify-center rounded-xl bg-primary-text font-semibold text-secondary-button disabled:text-placeholder-text">
            {isPending ? <Spinner /> : 'Log in'}
          </button>
          <div className="text-center">
            <a href="forgot-password" className="text-sm text-gray-7 hover:underline">
              Forgot password?
            </a>
          </div>
          <div className="flex items-center justify-center space-x-4 text-gray-7">
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
