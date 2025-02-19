import { redirect } from 'next/navigation'

import { validateRequest } from '@/lib/Lucia'

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const { user } = await validateRequest()
  if (user) {
    return redirect('/')
  }

  return (
    <>
      <div className="flex w-full max-w-[370px] flex-1 flex-col items-center justify-center sm:mt-[15vh]">
        {children}
      </div>
      <footer className="flex h-[70px] w-full items-center justify-center text-xs text-gray-7">© 2024</footer>
    </>
  )
}
