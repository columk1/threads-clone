import { redirect } from 'next/navigation'

import ResendOTPForm from '@/components/ResendOTPForm'
import { validateRequest } from '@/libs/Lucia'

export default async function ResendOTPPage() {
  const { user } = await validateRequest()
  const userExists = user && user.emailVerified
  if (userExists) {
    return redirect('/')
  }

  return (
    <ResendOTPForm />
  )
}
