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
      <div className="flex min-h-screen w-full flex-col md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg md:p-5">

      </div>
    </>
  )
}

export default Search
