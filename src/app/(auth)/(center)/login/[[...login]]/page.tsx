import LoginForm from '@/components/LoginForm'

export async function generateMetadata() {
  return {
    title: 'Sign in',
    description: 'Seamlessly sign in to your account with our user-friendly login process.',
  }
}

const LoginPage = () => (
  <div className="w-full px-3 sm:px-0">
    <h1 className="mb-4 text-center font-bold">Log in with your Facebook account</h1>
    <LoginForm />
  </div>
)

export default LoginPage
