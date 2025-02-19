import Link from 'next/link'

import LoginForm from '@/components/LoginForm'

export async function generateMetadata() {
  return {
    title: 'Log in',
    description: 'Log in to your Threads account',
  }
}

const LoginPage = () => (
  // Wrapper div only necessary to prevent next error: fixed element prevents auto-scroll behaviour
  <div className="flex w-full flex-col items-center">
    <div className="fixed top-0 mt-[min(calc(100vh-880px),_0px)] overflow-hidden max-sm:hidden">
      {/* Using next/Image creates a file 3x the size here */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        alt="Say more with Threads"
        src="/assets/images/banner.avif"
        width={1785}
        height={510}
        className="max-w-none"
      />
    </div>
    <div className="w-full px-3 sm:px-0">
      <h1 className="mb-4 text-center font-bold">Log in with your Threads account</h1>
      <div className="flex flex-col gap-4">
        <LoginForm />
        <div className="text-center text-sm text-gray-7">
          Don't have an account?&nbsp;
          <Link href="/signup" className="text-primary-text hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  </div>
)

export default LoginPage
