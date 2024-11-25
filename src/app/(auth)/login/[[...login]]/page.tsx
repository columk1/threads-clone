import LoginForm from '@/components/LoginForm'

export async function generateMetadata() {
  return {
    title: 'Sign in',
  }
}

const LoginPage = () => (
  <div className="w-full px-3 sm:px-0">
    <h1 className="mb-4 text-center font-bold">Log in with your Facebook account</h1>
    <LoginForm />
  </div>
)

export default LoginPage
