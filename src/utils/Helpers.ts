export const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  if (
    process.env.VERCEL_ENV === 'production'
    && process.env.VERCEL_PROJECT_PRODUCTION_URL
  ) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return 'http://localhost:3000'
}

export function debounce<T extends (...args: any[]) => void>(
  callback: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): void {
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      callback.apply(this, args)
    }, wait)
  }
}

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

type ValidationMessageFunction = (field: HTMLInputElement) => string

type ErrorMessages = {
  valueMissing?: string
  typeMismatch?: string
  tooShort?: ValidationMessageFunction
  customError?: ValidationMessageFunction
  defaultMessage?: string
  [key: string]: string | ValidationMessageFunction | undefined
}

export const createErrorMessageLookup = (
  fieldName: string,
  defaultMessage = '',
): ErrorMessages => ({
  valueMissing: `${capitalize(fieldName)} is required.`,
  typeMismatch: `Please enter a valid ${fieldName}.`,
  tooShort: field =>
    `${capitalize(fieldName)} should be at least ${field.minLength} characters long.`,
  customError: field => field.validationMessage,
  defaultMessage,
})

export const getError = (
  field: HTMLInputElement,
  errorMessages: ErrorMessages,
): string | undefined => {
  const validity = field.validity

  // Find the first validity state that is true and return the corresponding error message
  for (const [key, message] of Object.entries(errorMessages)) {
    if (validity[key as keyof ValidityState]) {
      if (typeof message === 'function') {
        return message(field)
      }
      return message
    }
  }
  // Return the default message if no other message was found
  return errorMessages.defaultMessage
}
