'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { type FunctionComponent, useActionState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'

import { signup } from '@/app/actions'
import { SignupSchema } from '@/models/zod.schema'
import { debounce } from '@/utils/Helpers'

import AuthInput from './AuthInput'
import FacebookAuthButton from './FacebookAuthButton'

const validateEmail = async (email: string, emailInputRef: React.RefObject<HTMLInputElement>) => {
  console.log('API CALL')
  const response = await fetch('/api/validate-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  })
  const { isUnique } = await response.json()
  if (!isUnique) {
    emailInputRef.current?.setCustomValidity('Email already in use')
  }
  return isUnique
}

const SignupForm: FunctionComponent = () => {
  const [state, formAction, isPending] = useActionState(signup, null)
  console.log('State: ', state)
  const formRef = useRef<HTMLFormElement>(null)
  const form = useForm<z.output<typeof SignupSchema>>({
    mode: 'onTouched',
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      username: '',
      ...(state?.data ?? {}),
    },
    delayError: 300,
  })
  const { register, setError, trigger, handleSubmit, setValue, formState: { errors, isSubmitting } } = form

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit(() => formRef.current?.submit())(e)
      }}
      autoComplete="off"
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
          {/* <input
            type="email"
            {...register('email')}
          />
          <span>{errors?.email?.message}</span> */}
          <AuthInput
            {...register('email')}
            onChange={debounce(async (e) => {
              const isEmailUnique = await validateEmail(e.target.value, formRef.current?.email)
              if (!isEmailUnique) {
                errors.email = { message: 'Email already exists', type: 'manual' }
                setError('email', { message: 'Email already exists', type: 'manual' })
              }
            }, 2000)}
            type="email"
            label="Email"
            placeholder="Email"
            autoCapitalize="none"
            required
            error={state?.error?.email || errors?.email?.message}
            // onBlur={() => formRef.current?.reportValidity()}
            className="text-input h-[3.25rem] rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light selection:bg-[#3b587c]"
          />
          <AuthInput
            {...register('password')}
            type="password"
            label="Password"
            placeholder="Password"
            minLength={8}
            autoComplete="new-password"
            autoCapitalize="none"
            required
            error={state?.error?.password || errors?.password?.message}
            className="text-input h-[3.25rem] rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light selection:bg-[#3b587c] placeholder:text-placeholder-text focus:border focus:border-primary-outline focus:outline-0"
          />
          <AuthInput
            {...register('name')}
            type="text"
            label="Full Name"
            placeholder="Full Name"
            required
            error={state?.error?.name || errors?.name?.message}
            className="text-input h-[3.25rem] rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light selection:bg-[#3b587c] placeholder:text-placeholder-text focus:border focus:border-primary-outline focus:outline-0"
          />
          <AuthInput
            {...register('username')}
            type="text"
            label="Username"
            placeholder="Username"
            autoComplete="new-username"
            required
            error={state?.error?.username || errors?.username?.message}
            className="text-input h-[3.25rem] rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light selection:bg-[#3b587c] placeholder:text-placeholder-text focus:border focus:border-primary-outline focus:outline-0"
          />
        </div>
        <div className="flex flex-col gap-4">
          <button type="submit" disabled={isPending} className="h-[3.25rem] w-full rounded-xl bg-primary-text font-semibold text-secondary-button">
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
