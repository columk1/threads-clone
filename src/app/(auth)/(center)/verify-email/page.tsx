import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import VerifyEmailForm from '@/components/VerifyEmailForm'
import { validateRequest } from '@/libs/Lucia'

export default async function VerifyEmailPage() {
  const { user } = await validateRequest()
  const userExists = user && user.emailVerified
  if (userExists) {
    return redirect('/')
  }

  // if (await downloadLimiter.hasExceededLimit(userKey, fallbackKey)) {
  //   return errorResponse(
  //     429,
  //     `We've noticed an unusual amount of downloading from your account. Contact support@civitai.com or come back later.`
  //   );
  // }

  return (
    <div className="w-full px-3 sm:px-0">
      <div className="mb-2 flex justify-center">
        <Image src="/assets/images/mail-logo.png" alt="Mail Icon with Threads Logo" width={96} height={90} />
      </div>
      <h1 className="mb-4 text-center font-bold">Enter Confirmation Code</h1>
      <p className="mb-4 text-center text-sm text-gray-text">
        Enter the confirmation code we sent to
        {`<email> `}
        <Link href="/resend-otp" className="text-primary-text hover:underline">
          Resend Code.
        </Link>
      </p>
      <VerifyEmailForm />
    </div>
  )
}
