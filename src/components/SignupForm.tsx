'use client'

import { type FunctionComponent, useActionState, useCallback, useRef, useState } from 'react'

import { signup } from '@/app/actions'

import AuthInput from './AuthInput'
import FacebookAuthButton from './FacebookAuthButton'

const isEmailUnique = async (email: string): Promise<boolean> => {
  const res = await fetch('/api/validate-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })

  if (res.ok) {
    const { isUnique } = await res.json()
    return isUnique
  }
  return true
}

const validateEmail = async (email: string) => {
  const isUnique = await isEmailUnique(email)
  if (!isUnique) {
    return {
      error: 'Another account is using the same email.',
    }
  }
  return Promise.resolve({ error: '' })
}

const SignupForm: FunctionComponent = () => {
  const [state, formAction, isPending] = useActionState(signup, null)
  const [isFormValid, setIsFormValid] = useState(false)

  const formRef = useRef<HTMLFormElement>(null)

  const handleInput = useCallback(() => {
    if (formRef.current && !state?.error) {
      setIsFormValid(formRef.current.checkValidity())
    }
  }, [state?.error])

  return (
    <form
      ref={formRef}
      action={formAction}
      autoComplete="off"
      onInput={handleInput}
    >
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
        <FacebookAuthButton iconSize="30" className="h-[3.25rem]">Log in with Facebook</FacebookAuthButton>
        <div className="flex items-center justify-center space-x-4 text-gray-text">
          <hr className="w-full border-[0.5px] border-primary-outline" />
          <span className="px-4">or</span>
          <hr className="w-full border-t border-primary-outline" />
        </div>
        <div className="flex flex-col gap-2">
          <AuthInput
            name="email"
            type="email"
            label="Email"
            placeholder="Email"
            defaultValue={state?.data?.email}
            autoCapitalize="none"
            required
            error={state?.error?.email}
            customValidator={validateEmail}
            validateForm={(isValid: boolean) => setIsFormValid(isValid)}
            className="text-input h-[3.25rem] rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light selection:bg-[#3b587c]"
          />
          <AuthInput
            name="password"
            type="password"
            label="Password"
            placeholder="Password"
            defaultValue={state?.data?.password}
            minLength={8}
            autoComplete="new-password"
            autoCapitalize="none"
            required
            error={state?.error?.password}
            className="text-input h-[3.25rem] rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light selection:bg-[#3b587c] placeholder:text-placeholder-text focus:border focus:border-primary-outline focus:outline-0"
          />
          <AuthInput
            name="name"
            type="text"
            label="Full Name"
            placeholder="Full Name"
            defaultValue={state?.data?.name}
            required
            error={state?.error?.name}
            className="text-input h-[3.25rem] rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light selection:bg-[#3b587c] placeholder:text-placeholder-text focus:border focus:border-primary-outline focus:outline-0"
          />
          <AuthInput
            name="username"
            type="text"
            label="Username"
            placeholder="Username"
            defaultValue={state?.data?.username}
            autoComplete="new-username"
            required
            error={state?.error?.username}
            className="text-input h-[3.25rem] rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light selection:bg-[#3b587c] placeholder:text-placeholder-text focus:border focus:border-primary-outline focus:outline-0"
          />
        </div>
        <div className="flex flex-col gap-4">
          <button type="submit" disabled={isPending || !isFormValid} className="h-[3.25rem] w-full rounded-xl bg-primary-text font-semibold text-secondary-button disabled:text-placeholder-text">
            Sign up
          </button>
          <div className="text-center text-sm text-gray-text ">
            Have an account?&nbsp;
            <a href="/sign-in" className="text-primary-text hover:underline">
              Log in
            </a>
          </div>
        </div>
      </div>
    </form>
  )
}

export default SignupForm
