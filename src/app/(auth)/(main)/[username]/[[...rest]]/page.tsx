import { logger } from '@/libs/Logger'

export async function generateMetadata() {
  return {
    title: 'User Profile',
  }
}

const UserProfilePage = async ({ params }: { params: { username: string } }) => {
  logger.info(params)
  // const user = await currentUser()

  // if (!user || user.username !== params.username) {
  //   return notFound()
  // }

  return (
    <div className="my-6 -ml-16">
      {/* <UserProfile path={`/${user.username}`} /> */}
    </div>
  )
}

export default UserProfilePage
