import Header from '@/components/Header'
import { logger } from '@/libs/Logger'

export async function generateMetadata() {
  return {
    title: 'User Profile',
  }
}

const UserProfilePage = async ({ params }: { params: { username: string } } | any) => {
  const { username } = await params
  logger.info(username)
  // const user = await currentUser()

  // if (!user || user.username !== params.username) {
  //   return notFound()
  // }

  return (
    <>
      <Header title="Profile" />
      <div className="flex min-h-screen w-full flex-col md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg md:p-5">

      </div>
      {/* <UserProfile path={`/${user.username}`} /> */}
    </>
  )
}

export default UserProfilePage
