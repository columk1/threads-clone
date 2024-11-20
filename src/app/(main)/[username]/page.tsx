import { notFound } from 'next/navigation'

import { getPublicUserInfo, getUserInfo } from '@/app/actions'
import Header from '@/components/Header'
import { validateRequest } from '@/libs/Lucia'
import { usernameParamSchema } from '@/models/zod.schema'

export async function generateMetadata() {
  return {
    title: 'User Profile',
  }
}

const UserProfilePage = async ({ params }: { params: { username: string } } | any) => {
  const { username } = await params
  const result = usernameParamSchema.safeParse(username)
  if (!result.success) {
    notFound()
  }

  const { user: currentUser } = await validateRequest()

  const res = await (currentUser ? getUserInfo(result.data) : getPublicUserInfo(result.data))
  if ('error' in res) {
    notFound()
  }
  // Branch for public user page
  if (!currentUser) {
    return (
      <>
        <Header title={`${res.user.username}'s public profile`} />
        <div className="flex w-full flex-1 flex-col md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg">

        </div>
      </>
    )
  }

  // Branch for current user's profile
  if (currentUser.username === res.user.username) {
    return (
      <>
        <Header title="Current User'sProfile" />
        <div className="flex w-full flex-1 flex-col md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg">

        </div>
        {/* <UserProfile path={`/${user.username}`} /> */}
      </>
    )
  }

  // Branch for private user page
  return (
    <>
      <Header title={`${res.user.username}'s profile'`} />
      <div className="flex w-full flex-1 flex-col md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg">

      </div>
      {/* <UserProfile path={`/${user.username}`} /> */}
    </>
  )
}

export default UserProfilePage
