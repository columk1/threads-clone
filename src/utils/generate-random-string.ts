import { randomBytes } from 'node:crypto'

export const generateRandomString = (length: number): string => {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_'
  const charactersLength = characters.length
  let result = ''
  const randomBytesBuffer = randomBytes(length)

  for (let i = 0; i < length; i++) {
    const byte = randomBytesBuffer[i]
    if (byte !== undefined) {
      result += characters[byte % charactersLength]
    }
  }
  return result
}
