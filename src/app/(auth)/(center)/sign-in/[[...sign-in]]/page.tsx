import AuthInput from '@/components/AuthInput'
import FacebookAuthButton from '@/components/FacebookAuthButton'

export async function generateMetadata() {
  return {
    title: 'Sign in',
    description: 'Seamlessly sign in to your account with our user-friendly login process.',
  }
}

const SignInPage = () => (
  <div className="w-full px-3 sm:px-0">
    <h1 className="mb-4 text-center font-bold">Log in with your Facebook account</h1>
    <form>
      <div className="flex w-full flex-col gap-2 text-[15px]">
        <div className="flex flex-col gap-2">
          <AuthInput
            type="text"
            label="Username, phone or email"
            placeholder="Username, phone or email"
            name="username"
            className="text-input h-[3.25rem] rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light selection:bg-[#3b587c] placeholder:text-placeholder-text focus:border focus:border-primary-outline focus:outline-0"
          />
          <AuthInput
            type="password"
            label="Password"
            placeholder="Password"
            name="password"
            className="text-input h-[3.25rem] rounded-xl border border-transparent bg-tertiary-bg p-4 font-sans font-light selection:bg-[#3b587c] placeholder:text-placeholder-text focus:border focus:border-primary-outline focus:outline-0"
          />
        </div>
        <div className="flex flex-col gap-4">
          <button type="submit" className="h-[3.25rem] w-full rounded-xl bg-primary-text font-semibold text-secondary-button">
            Log in
          </button>
          <div className="text-center">
            <a href="forgot-password" className="text-sm text-gray-text hover:underline">
              Forgot password?
            </a>
          </div>
          <div className="flex items-center justify-center space-x-4 text-gray-text">
            <hr className="w-full border-[0.5px] border-primary-outline" />
            <span className="px-4">or</span>
            <hr className="w-full border-t border-primary-outline" />
          </div>
          <FacebookAuthButton>Continue with Facebook</FacebookAuthButton>
        </div>
      </div>
    </form>
  </div>
)

export default SignInPage
