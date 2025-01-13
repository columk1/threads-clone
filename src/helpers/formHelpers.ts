import { getBaseUrl } from '@/utils/getBaseUrl'

type ValidationMessageFunction = (field: HTMLInputElement) => string

type ErrorMessages = {
  valueMissing?: string
  typeMismatch?: string
  tooShort?: ValidationMessageFunction
  customError?: ValidationMessageFunction
  defaultMessage?: string
  [key: string]: string | ValidationMessageFunction | undefined
}

export const createErrorMessageLookup = (fieldName: string, defaultMessage = ''): ErrorMessages => ({
  valueMissing: `This field is required.`,
  typeMismatch: `Enter a valid ${fieldName}.`,
  tooShort: (field) => `Create a ${fieldName} at least ${field.minLength} characters long.`,
  customError: (field) => field.validationMessage,
  defaultMessage,
})

export const getError = (field: HTMLInputElement, errorMessages: ErrorMessages): string | undefined => {
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

/*
 * Is Unique Email
 */

export const isUniqueEmail = async (email: string) =>
  await fetch(`${getBaseUrl()}/api/users/validate?email=${encodeURIComponent(email)}`).then((res) => res.ok)

/*
 * Is Unique Email
 */

export const isUniqueUsername = async (username: string) =>
  await fetch(`${getBaseUrl()}/api/users/validate?username=${encodeURIComponent(username)}`).then((res) => res.ok)
