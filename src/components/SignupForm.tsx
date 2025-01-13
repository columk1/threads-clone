'use client'

import Link from 'next/link'
import { type FunctionComponent, useActionState, useCallback, useRef, useState } from 'react'

import { isUniqueEmail, isUniqueUsername } from '@/helpers/formHelpers'
import { signup } from '@/services/auth/auth.actions'

import AuthInput from './AuthInput'
import FacebookAuthButton from './FacebookAuthButton'

const VALIDATION_DELAY = 300

const validateEmail = async (email: string) => {
  const isUnique = await isUniqueEmail(email)
  if (!isUnique) {
    return {
      error: 'Another account is using the same email.',
    }
  }
  return Promise.resolve({ error: '' })
}

const validateUsername = async (username: string) => {
  const isUnique = await isUniqueUsername(username)
  if (!isUnique) {
    return {
      error: 'A user with that username already exists.',
    }
  }
  return Promise.resolve({ error: '' })
}

const SignupForm: FunctionComponent = () => {
  const [state, formAction, isPending] = useActionState(signup, null)
  const [isFormValid, setIsFormValid] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)

  const handleInput = useCallback(() => {
    if (formRef.current) {
      setIsFormValid(formRef.current.checkValidity())
    }
  }, [])

  const setCustomValidity = useCallback((isValid: boolean) => {
    setIsFormValid(isValid)
  }, [])

  return (
    <form ref={formRef} action={formAction} autoComplete="off" onInput={handleInput}>
      <div className="flex w-full flex-col gap-2 text-[15px]">
        {/* {state?.error && (
          <div>
            {Object.entries(state.error).map(([key, value]) => (
              <p key={key} className="text-red-500">
                {value.join(', ')}
              </p>
            ))}
          </div>
        )} */}
        <FacebookAuthButton iconSize="30" className="h-[3.25rem]">
          Log in with Facebook
        </FacebookAuthButton>
        <div className="flex items-center justify-center space-x-4 text-gray-7">
          <hr className="w-full border-[0.5px] border-primary-outline" />
          <span className="px-4">or</span>
          <hr className="w-full border-t border-primary-outline" />
        </div>
        <div className="flex flex-col gap-2">
          <AuthInput
            name="email"
            type="email"
            label="Email"
            placeholder=""
            defaultValue={state?.initialValue?.email?.toString()}
            autoCapitalize="none"
            required
            error={state?.error?.email && state?.error?.email[0]}
            customValidator={validateEmail}
            delay={VALIDATION_DELAY}
            icons
            validateForm={setCustomValidity}
            className="text-input h-[3.25rem] rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light selection:bg-[#3b587c]"
          />
          <AuthInput
            name="password"
            type="password"
            label="Password"
            placeholder=""
            defaultValue=""
            minLength={6}
            autoComplete="new-password"
            autoCapitalize="none"
            required
            delay={VALIDATION_DELAY}
            icons
            error={state?.error?.password && state?.error?.password[0]}
            className="text-input h-[3.25rem] rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light selection:bg-[#3b587c] placeholder:text-placeholder-text focus:border focus:border-primary-outline focus:outline-0"
          />
          <AuthInput
            name="name"
            type="text"
            label="Full Name"
            placeholder=""
            defaultValue={state?.initialValue?.name?.toString()}
            required
            delay={VALIDATION_DELAY}
            icons
            error={state?.error?.name && state?.error?.name[0]}
            className="text-input h-[3.25rem] rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light selection:bg-[#3b587c] placeholder:text-placeholder-text focus:border focus:border-primary-outline focus:outline-0"
          />
          <AuthInput
            name="username"
            type="text"
            label="Username"
            placeholder=""
            defaultValue={state?.initialValue?.username?.toString()}
            autoComplete="new-username"
            required
            error={state?.error?.username && state?.error?.username[0]}
            customValidator={validateUsername}
            validateForm={setCustomValidity}
            delay={VALIDATION_DELAY}
            icons
            className="text-input h-[3.25rem] rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light selection:bg-[#3b587c] placeholder:text-placeholder-text focus:border focus:border-primary-outline focus:outline-0"
          />
        </div>
        <div className="flex flex-col gap-4">
          <button
            type="submit"
            disabled={isPending || !isFormValid}
            className="h-[3.25rem] w-full rounded-xl bg-primary-text font-semibold text-secondary-button disabled:text-placeholder-text"
          >
            Sign up
          </button>
          <div className="text-center text-sm text-gray-7">
            Have an account?&nbsp;
            <Link href="/login" className="text-primary-text hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </form>
  )
}

export default SignupForm
