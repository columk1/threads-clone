// import type { User } from 'lucia'
// import Link from 'next/link'

// import AuthPromptModal from '@/components/AuthPromptModal'
// import MobileHeader from '@/components/MobileHeader'
// import MobileSidebar from '@/components/MobileSidebar'
// import Sidebar from '@/components/Sidebar'

// export const BaseTemplate = ({ user, children }: {
//   user: User | null
//   children: React.ReactNode
// }) => {
//   // user = null

//   return (
//     <div className="flex min-h-screen flex-col items-center justify-center bg-primary-bg text-gray-6 antialiased md:bg-secondary-bg md:px-5">
//       <MobileHeader user={user} />
//       <Sidebar user={user} />
//       <MobileSidebar user={user} />
//       {!user && (
//         <>
//           <Link href="/login" className="fixed right-5 top-5 flex h-[34px] items-center justify-center rounded-lg border border-gray-5 bg-white px-4 text-[15px] font-semibold transition active:scale-95 disabled:opacity-30">Log in</Link>
//           <AuthPromptModal />
//         </>
//       )}
//       <main className="flex w-full flex-1 flex-col text-primary-text max-md:mt-[60px] md:w-full md:max-w-[min(calc(100%-(1.5*var(--sidebar-width))),640px)]">
//         {children}
//       </main>
//     </div>
//   )
// }
