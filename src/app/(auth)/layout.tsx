export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="flex w-full max-w-[370px] flex-1 flex-col items-center justify-center sm:mt-[15vh]">
        {children}
      </div>
      <footer className="flex h-[70px] w-full items-center justify-center text-xs text-secondary-text">© 2024</footer>
    </>
  )
}
