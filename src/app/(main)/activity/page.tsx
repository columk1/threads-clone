import Header from '@/components/Header'

export const metadata = {
  title: 'Activity',
}

const Activity = () => {
  return (
    <>
      <Header title="Activity" />
      <div className="flex w-full flex-1 flex-col md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg">

      </div>
      {/* <p>Welcome to my Activity page! Here you will find a carefully curated collection of my work and accomplishments. Through this Activity, I'm to showcase my expertise, creativity, and the value I can bring to your projects.</p>

      <div className="grid grid-cols-1 justify-items-start gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from(Array(6).keys()).map(elt => (
          <Link
            className="hover:text-blue-700"
            key={elt}
            href={`/activity/${elt}`}
          >
            {`Porfolio ${elt}`}
          </Link>
        ))}
      </div> */}
    </>
  )
}

export default Activity
