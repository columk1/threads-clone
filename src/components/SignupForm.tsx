'use client'

import Link from 'next/link'
import { type FunctionComponent, useActionState, useCallback, useRef, useState } from 'react'

import { validateUniqueEmail, validateUniqueUsername } from '@/helpers/formHelpers'
import { signup } from '@/services/auth/auth.actions'

import AuthInput from './AuthInput'
import Divider from './Divider'
import GoogleAuthButton from './GoogleAuthButton'

const VALIDATION_DELAY = 300

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
      <div className="flex w-full flex-col gap-4 text-ms">
        <GoogleAuthButton iconSize="30" className="h-[3.25rem]">
          Log in with Google
        </GoogleAuthButton>
        <Divider text="or" />
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
            customValidator={validateUniqueEmail}
            delay={VALIDATION_DELAY}
            icons
            setFormValidity={setCustomValidity}
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
            label="Full name"
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
            customValidator={validateUniqueUsername}
            setFormValidity={setCustomValidity}
            delay={VALIDATION_DELAY}
            icons
            className="text-input h-[3.25rem] rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light selection:bg-[#3b587c] placeholder:text-placeholder-text focus:border focus:border-primary-outline focus:outline-0"
          />
          <button
            type="submit"
            disabled={isPending || !isFormValid}
            className="h-[3.25rem] w-full rounded-xl bg-primary-text font-semibold text-secondary-button disabled:text-placeholder-text"
          >
            Sign up
          </button>
        </div>
        <div className="text-center text-sm text-secondary-text">
          Have an account?&nbsp;
          <Link href="/login" className="text-primary-text hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </form>
  )
}

export default SignupForm
