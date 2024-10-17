type AuthInputProps = {
  type: 'text' | 'password' | 'email' // Add more types as needed
  name: string
  placeholder: string
  label: string // Screen reader label
  autoComplete?: string
  autoCapitalize?: string
  required?: boolean
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
  className = '',
}: AuthInputProps) => {
  return (
    <div>
      <label htmlFor={name} className="sr-only">
        {label}
      </label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className={`text-input h-12 w-full rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light placeholder:text-placeholder-text focus:border focus:border-primary-outline focus:outline-0 ${className}`}
        id={name}
        autoComplete={autoComplete}
        autoCapitalize={autoCapitalize}
        autoCorrect="off"
        required={required}
      />
    </div>
  )
}

export default Input
