import Header from '@/components/Header'
import SearchContent from '@/components/SearchContent'
import { validateRequest } from '@/lib/Lucia'

export const metadata = {
  title: 'Search',
}

export default async function Search() {
  const { user } = await validateRequest()
  return (
    <>
      <Header title="Search" />
      <div className="flex w-full flex-1 flex-col md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg">
        <SearchContent currentUser={user || undefined} />
      </div>
    </>
  )
}
