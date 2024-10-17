import AuthInput from '@/components/AuthInput'
import FacebookAuthButton from '@/components/FacebookAuthButton'

export async function generateMetadata() {
  return {
    title: 'Sign up',
    description: 'Effortlessly create an account through our intuitive sign-up process.',
  }
}

const SignUpPage = () => (
  <div className="w-full px-3 sm:px-0">
    <h1 className="mb-4 text-center font-bold">Join Threads to share thoughts, find out what's going on, follow your people and more</h1>
    <form autoComplete="off">
      <div className="flex w-full flex-col gap-2 text-[15px]">
        <FacebookAuthButton iconSize="30" className="h-[3.25rem]">Log in with Facebook</FacebookAuthButton>
        <div className="flex items-center justify-center space-x-4 text-gray-text">
          <hr className="w-full border-[0.5px] border-primary-outline" />
          <span className="px-4">or</span>
          <hr className="w-full border-t border-primary-outline" />
        </div>
        <div className="flex flex-col gap-2">
          <AuthInput
            type="email"
            label="Email"
            placeholder="Email"
            name="email"
            autoCapitalize="none"
            required
            className="text-input h-[3.25rem] rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light selection:bg-[#3b587c] placeholder:text-placeholder-text focus:border focus:border-primary-outline focus:outline-0"
          />
          <AuthInput
            type="password"
            label="Password"
            placeholder="Password"
            name="password"
            autoComplete="new-password"
            autoCapitalize="none"
            className="text-input h-[3.25rem] rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light selection:bg-[#3b587c] placeholder:text-placeholder-text focus:border focus:border-primary-outline focus:outline-0"
          />
          <AuthInput
            type="text"
            label="Full Name"
            placeholder="Full Name"
            name="name"
            className="text-input h-[3.25rem] rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light selection:bg-[#3b587c] placeholder:text-placeholder-text focus:border focus:border-primary-outline focus:outline-0"
          />
          <AuthInput
            type="text"
            label="Username"
            placeholder="Username"
            name="username"
            className="text-input h-[3.25rem] rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light selection:bg-[#3b587c] placeholder:text-placeholder-text focus:border focus:border-primary-outline focus:outline-0"
          />
        </div>
        <div className="flex flex-col gap-4">
          <button type="submit" className="h-[3.25rem] w-full rounded-xl bg-primary-text font-semibold text-secondary-button">
            Sign up
          </button>
          <div className="text-center text-sm text-gray-text ">
            Have an account?&nbsp;
            <a href="/sign-in" className="text-primary-text hover:underline">
              Log in
            </a>
          </div>
        </div>
      </div>
    </form>
  </div>
)

export default SignUpPage
