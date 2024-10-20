import { useRef, useState } from 'react'

import { debounce } from '@/utils/Helpers'

type AuthInputProps = {
  type: 'text' | 'password' | 'email' // Add more types as needed
  name: string
  placeholder: string
  label: string // Screen reader label
  autoComplete?: string
  autoCapitalize?: string
  required?: boolean
  minLength?: number
  error?: string | null
  customValidator?: (value: string) => { error: string } | Promise<{ error: string }>
  className?: string
}

const Input = ({
  type,
  name,
  placeholder,
  label,
  autoComplete,
  autoCapitalize,
  required,
  minLength,
  error = null,
  customValidator,
  className = '',
}: AuthInputProps) => {
  const [validationMessage, setValidationMessage] = useState<string | null>(error)
  const [activeError, setActiveError] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  const debouncedValidator = debounce(async (value: string) => {
    let message = inputRef.current?.validationMessage || ''
    if (customValidator) {
      const { error } = await customValidator(value)
      if (error) {
        message = error
        inputRef.current?.setCustomValidity(message)
      }
    }
    setValidationMessage(message)
    setActiveError(true)
  }, 1000)

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    inputRef.current?.setCustomValidity('')
    setActiveError(false)
    debouncedValidator(e.target.value)
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
        className={`text-input peer h-12 w-full rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light placeholder:text-placeholder-text focus:border focus:border-primary-outline focus:outline-0 ${className} ${activeError && '[&:user-invalid]:border-red-500'}`}
        id={name}
        autoComplete={autoComplete}
        autoCapitalize={autoCapitalize}
        autoCorrect="off"
        required={required}
        minLength={minLength}
        onChange={onChange}
      />
      {activeError && <p className="hidden py-1 pl-4 text-sm text-red-500 peer-[&:user-invalid]:block">{error || inputRef.current?.validationMessage || validationMessage}</p>}
    </div>
  )
}

export default Input
