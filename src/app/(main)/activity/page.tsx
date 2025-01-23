import Header from '@/components/Header'

export const metadata = {
  title: 'Activity',
}

const Activity = () => {
  return (
    <>
      <Header title="Activity" />
      <div className="flex w-full flex-1 flex-col md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg">
        <div className="mx-auto my-[calc(50%+60px)] py-3 text-gray-8">Under development</div>
      </div>
    </>
  )
}

export default Activity
