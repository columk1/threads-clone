import Link from 'next/link'

export async function generateMetadata() {
  return {
    title: 'Activity',
    description: 'Welcome to my activity page!',
  }
}

const Activity = () => {
  return (
    <>
      <p>Welcome to my Activity page! Here you will find a carefully curated collection of my work and accomplishments. Through this Activity, I'm to showcase my expertise, creativity, and the value I can bring to your projects.</p>

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
      </div>
    </>
  )
}

export default Activity