import Header from '@/components/Header'
import { SearchIcon } from '@/components/icons'

export const metadata = {
  title: 'Search',
}

const Search = () => {
  return (
    <>
      <Header title="Search" />
      <div className="flex w-full flex-1 flex-col md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg">
        <div className="flex flex-col px-6 pt-[18px] text-[15px]">
          <div className="relative">
            <SearchIcon className="absolute left-6 top-1/2 size-[16px] -translate-y-1/2 text-gray-6" />
            <input
              type="text"
              placeholder="Search"
              className="w-full rounded-2xl border-[0.5px] border-primary-outline bg-gray-0 py-3 pl-12 pr-4 placeholder:text-gray-7 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default Search
