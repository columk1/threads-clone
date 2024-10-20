import SignupForm from '@/components/SignupForm'

export async function generateMetadata() {
  return {
    title: 'Sign up',
    description: 'Effortlessly create an account through our intuitive sign-up process.',
  }
}

// const signUp = async (formData: FormData) => {
//   const { data, error } = await signup(formData)
// }

const SignUpPage = () => {
  return (
    <div className="w-full px-3 sm:px-0">
      <h1 className="mb-4 text-center font-bold">Join Threads to share thoughts, find out what's going on, follow your people and more</h1>
      <SignupForm />
    </div>
  )
}
export default SignUpPage
