import Image from 'next/image'
import { redirect } from 'next/navigation'

import VerifyEmailForm from '@/components/VerifyEmailForm'
import { ROUTES } from '@/lib/constants'
import { validateRequest } from '@/lib/Session'

export default async function VerifyEmailPage() {
  const { user } = await validateRequest()
  if (!user) {
    return redirect(ROUTES.LOGIN)
  }

  if (user.emailVerified) {
    return redirect('/')
  }

  return (
    <div className="w-full px-3 sm:px-0">
      <div className="mb-2 flex justify-center">
        <Image priority src="/assets/images/mail-logo.png" alt="Mail Icon with Threads Logo" width={96} height={84} />
      </div>
      <h1 className="mb-4 text-center font-bold">Enter Confirmation Code</h1>
      <VerifyEmailForm userEmail={user.email} />
    </div>
  )
}
