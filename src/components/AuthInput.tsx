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
    }
  }, 1000)

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    inputRef.current?.setCustomValidity('')
    setActiveError(false)
    validate(e.target, customValidator)
  }
  return (
    <div>
      <label htmlFor={name} className="sr-only">
        {label}
      </label>
      <input
        ref={inputRef}
        type={type}
        name={name}
        placeholder={placeholder}
        className={`text-input peer h-12 w-full rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light placeholder:text-placeholder-text focus:border focus:border-primary-outline focus:outline-0 ${className} ${activeError && '[&:user-invalid]:border-red-500'} ${error && 'peer-invalid:border-red-500'}`}
        id={name}
        defaultValue={defaultValue}
        autoComplete={autoComplete}
        autoCapitalize={autoCapitalize}
        autoCorrect="off"
        required={required}
        minLength={minLength}
        onChange={onChange}
      />
      {activeError && <p className={`hidden py-1 pl-4 text-sm text-red-500 ${error && 'peer-invalid:block'} peer-[&:user-invalid]:block`}>{validationMessage || error}</p>}
    </div>
  )
}

export default Input
