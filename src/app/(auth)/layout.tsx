export default function AuthLayout(props: {
  children: React.ReactNode
}) {
  // const signInUrl = '/login'
  // const signUpUrl = '/signup'
  // const dashboardUrl = '/'
  // const afterSignOutUrl = '/'

  return (
    <>
      {props.children}
      <footer className="flex h-[70px] w-full items-center justify-center text-xs text-gray-1">
        © 2024
      </footer>
    </>
  )
}
