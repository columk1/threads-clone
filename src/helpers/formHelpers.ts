import type { ValidateUserFieldResponse } from '@/app/api/users/validate/route'

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

type UniqueField = 'email' | 'username'

const validateUniqueUserField = async (field: UniqueField, value: string): Promise<ValidateUserFieldResponse> => {
  const response = await fetch(`/api/users/validate?${field}=${encodeURIComponent(value)}`)
  return response.json()
}

/*
 * Validate Email and Username
 */
export const validateUniqueField = async (field: UniqueField, value: string) => {
  const errorMessages = {
    email: 'Another account is using the same email.',
    username: 'A user with that username already exists.',
  }

  const response = await validateUniqueUserField(field, value)
  if ('isUnique' in response && response.isUnique === false) {
    return {
      error: errorMessages[field],
    }
  }
  return { error: '' }
}

// Convenience functions to maintain backwards compatibility
export const validateUniqueEmail = (email: string) => validateUniqueField('email', email)
export const validateUniqueUsername = (username: string) => validateUniqueField('username', username)
