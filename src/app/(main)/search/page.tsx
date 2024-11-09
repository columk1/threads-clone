import Header from '@/components/Header'

export async function generateMetadata() {
  return {
    title: 'Search',
    description: 'Search page description',
  }
}

const Search = () => {
  return (
    <>
      <Header title="Search" />
      <div className="flex w-full flex-1 flex-col md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg">

      </div>
    </>
  )
}

export default Search
