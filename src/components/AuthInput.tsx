import cx from 'clsx'
import { CircleCheck, CircleX } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { createErrorMessageLookup, debounce, getError } from '@/utils/Helpers'

type AuthInputProps = {
  type: 'text' | 'password' | 'email' // Add more types as needed
  name: string
  placeholder?: string
  label: string // Screen reader label
  defaultValue?: string
  autoComplete?: string
  autoCapitalize?: string
  required?: boolean
  minLength?: number
  error?: string | null
  customValidator?: (value: string) => Promise<{ error: string }>
  delay?: number
  validateForm?: (isValid: boolean) => void
  className?: string
}

const Input = ({
  type,
  name,
  placeholder,
  label,
  defaultValue,
  autoComplete,
  autoCapitalize,
  required,
  minLength,
  error = null,
  customValidator,
  delay = 1000,
  validateForm,
  className = '',
}: AuthInputProps) => {
  const [validationMessage, setValidationMessage] = useState<string | null>(error)
  const [activeError, setActiveError] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const errorMessages = createErrorMessageLookup(name)

  useEffect(() => {
    if (inputRef.current && error) {
      inputRef.current.setCustomValidity(error)
      setActiveError(true)
    }
  }, [error])

  const validate = debounce(async (input: HTMLInputElement, customValidator?: (value: string) => Promise<{ error: string }>) => {
    if (input) {
      let message = getError(input, errorMessages) || ''
      if (customValidator && input.validity.valid) {
        const { error } = await customValidator(input.value)
        if (error) {
          message = error
          input.setCustomValidity(message) // CSS: Activates :invalid pseudo-class
          validateForm?.(false)
        }
      }
      setValidationMessage(message)
      setActiveError(true)
      validateForm?.(!message)
    }
  }, delay)

  const onChange = () => {
    inputRef.current?.setCustomValidity('')
    setActiveError(false)
  }

  const onBlur = async (e: React.ChangeEvent<HTMLInputElement>) => {
    validate(e.target, customValidator)
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type={type}
        name={name}
        placeholder={placeholder}
        className={cx(
          'text-input peer pr-10 h-12 w-full rounded-xl border border-transparent bg-tertiary-bg font-sans font-light placeholder:text-placeholder-text focus:border focus:border-primary-outline focus:outline-0',
          !placeholder && '[&:not(:placeholder-shown)]:pb-0',
          `${className}`,
          activeError && '[&:user-invalid]:border-red-500',
          error && 'peer-invalid:border-red-500',
        )}
        id={name}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        autoCapitalize={autoCapitalize}
        autoCorrect="off"
        required={required}
        minLength={minLength}
        onChange={onChange}
        onBlur={onBlur}
      />
      <label htmlFor={name} className={placeholder ? 'sr-only' : 'pointer-events-none absolute left-[17px] origin-top-left translate-y-[14px] scale-100 font-light text-placeholder-text transition peer-[:not(:placeholder-shown)]:translate-y-1 peer-[:not(:placeholder-shown)]:scale-75'}>
        {label}
      </label>
      {activeError && <CircleX className={`absolute right-2 top-[14px] hidden text-red-500 ${error && 'peer-invalid:block'} peer-[&:user-invalid]:block`} />}
      {activeError && !validationMessage && <CircleCheck className="absolute right-2 top-[14px] hidden text-placeholder-text peer-[&:not(:focus-within):user-valid]:block" />}
      {activeError && <p className={`hidden py-1 pl-4 text-sm text-red-500 ${error && 'peer-invalid:block'} peer-[&:user-invalid]:block`}>{validationMessage || error}</p>}
    </div>
  )
}

export default Input
