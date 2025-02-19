'use client'

import { useActionState, useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import Spinner from '@/components/spinner/Spinner'
import { login } from '@/services/auth/auth.actions'

import AuthInput from './AuthInput'
import Divider from './Divider'
import GoogleAuthButton from './GoogleAuthButton'

const LoginForm = () => {
  const [state, formAction, isPending] = useActionState(login, null)
  const [isValid, setIsValid] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)

  const getValidity = useCallback(
    () => formRef?.current?.email?.value !== '' && formRef?.current?.password?.value !== '',
    [],
  )

  const handleInput = useCallback(() => {
    if (isValid !== getValidity()) {
      setIsValid(!isValid)
    }
  }, [isValid, getValidity])

  useEffect(() => {
    if (state?.error?.email) {
      toast(state.error.email[0])
    }
    if (state?.error?.password) {
      toast(state.error.password[0])
    }
  }, [state?.error])

  return (
    <form ref={formRef} onInput={handleInput} action={formAction} autoComplete="off">
      <div className="flex w-full flex-col gap-2 text-[15px]">
        <div className="flex flex-col gap-2">
          <AuthInput
            type="text"
            name="email"
            label="Username or email"
            placeholder="Username or email"
            autoComplete="current-email"
            defaultValue={state?.initialValue?.email?.toString()}
            className="text-input h-[3.25rem] rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light selection:bg-[#3b587c] placeholder:text-placeholder-text focus:border focus:border-primary-outline focus:outline-0"
          />
          <AuthInput
            type="password"
            name="password"
            label="Password"
            placeholder="Password"
            autoComplete="current-password"
            defaultValue={state?.initialValue?.password?.toString()}
            className="text-input h-[3.25rem] rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light selection:bg-[#3b587c] placeholder:text-placeholder-text focus:border focus:border-primary-outline focus:outline-0"
          />
        </div>
        <div className="flex flex-col gap-4">
          <button
            type="submit"
            disabled={!isValid && !isPending}
            className="flex h-[3.25rem] w-full items-center justify-center rounded-xl bg-primary-text font-semibold text-secondary-button disabled:text-placeholder-text"
          >
            {isPending ? <Spinner /> : 'Log in'}
          </button>
          <div className="text-center">
            <a href="forgot-password" className="text-sm text-gray-7 hover:underline">
              Forgot password?
            </a>
          </div>
          <Divider text="or" />
          <GoogleAuthButton>Continue with Google</GoogleAuthButton>
        </div>
      </div>
    </form>
  )
}

export default LoginForm
