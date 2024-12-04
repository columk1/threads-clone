import Image from 'next/image'

type IPortfolioDetailProps = {
  params: { slug: string }
}

export function generateStaticParams() {
  return Array.from({ length: 6 }, (_, i) => ({ slug: `${i}` }))
}

export async function generateMetadata(props: IPortfolioDetailProps) {
  return {
    title: `Portfolio ${props.params.slug}`,
    description: `meta_description ${props.params.slug}`,
  }
}

const PortfolioDetail = (props: IPortfolioDetailProps) => {
  return (
    <>
      <h1 className="capitalize">{`Portfolio ${props.params.slug}`}</h1>
      <p>Created a set of promotional materials and branding elements for a corporate event. Crafted a visually unified theme, encompassing a logo, posters, banners, and digital assets. Integrated the client's brand identity while infusing it with a contemporary and innovative approach. Garnered favorable responses from event attendees, resulting in a successful event with heightened participant engagement and increased brand visibility.</p>

      <div className="mt-5 text-center text-sm">
        Log management powered by
        <a
          className="text-blue-700 hover:border-b-2 hover:border-blue-700"
          href="https://betterstack.com/?utm_source=github&utm_medium=sponsorship&utm_campaign=next-js-boilerplate"
        >
          Better Stack
        </a>
      </div>

      <a
        href="https://betterstack.com/?utm_source=github&utm_medium=sponsorship&utm_campaign=next-js-boilerplate"
      >
        <Image
          className="mx-auto mt-2"
          src="/assets/images/better-stack-dark.png"
          alt="Better Stack"
          width={130}
          height={112}
        />
      </a>
    </>
  )
}

export const dynamicParams = false

export default PortfolioDetail
