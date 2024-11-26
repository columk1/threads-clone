import { notFound } from 'next/navigation'

import { getPublicUserInfo, getUserInfo } from '@/app/actions'
import Avatar from '@/components/Avatar'
import Header from '@/components/Header'
import ProfileNavigation from '@/components/ProfileNavigation'
import UserProfile from '@/components/UserProfile'
import { validateRequest } from '@/libs/Lucia'
import { usernameParamSchema } from '@/models/zod.schema'

type Props = {
  params: Promise<{ username: string }>
  children: React.ReactNode
}

const fetchUserInfo = async (isCurrentUser: boolean, username: string) => {
  return await (isCurrentUser ? getUserInfo(username) : getPublicUserInfo(username))
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params
  const result = usernameParamSchema.safeParse(username)
  if (!result.success) {
    notFound()
  }
  const { user: currentUser } = await validateRequest()

  const res = await fetchUserInfo(!!currentUser, result.data)
  if ('error' in res) {
    notFound()
  }
  return {
    title: `${res.user.username}`,
  }
}

const UserProfileLayout = async ({ params, children }: Props) => {
  const { username } = await params
  const result = usernameParamSchema.safeParse(username)
  if (!result.success) {
    notFound()
  }

  const { user: currentUser } = await validateRequest()

  const res = await fetchUserInfo(!!currentUser, result.data)
  if ('error' in res) {
    notFound()
  }

  const user = res.user
  // Branch for public user page
  if (currentUser?.username !== user.username) {
    return (
      <UserProfile initialUser={user}>
        {children}
      </UserProfile>
    )
  }

  // Branch for current user's profile
  return (
    <>
      <Header title="Profile" />
      <div className="flex w-full flex-1 flex-col md:rounded-t-3xl md:border-[0.5px] md:border-gray-4 md:bg-active-bg">

        <div className="flex w-full flex-col items-center justify-center gap-4 px-6 py-5 text-[15px] font-normal">
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col">
              <span className="text-2xl font-semibold">
                {user.name}
              </span>
              <span>{user.username}</span>
            </div>
            <Avatar size="md" />
          </div>
          <div className="flex flex-col gap-1.5 self-start">
            <div>
              {user.bio}
            </div>
            <div className="text-gray-7">
              {`${Intl.NumberFormat().format(user.followerCount)} follower${user.followerCount !== 1 ? 's' : ''}`}
            </div>
          </div>
          <button type="button" className="h-9 w-full rounded-lg border border-gray-5 px-4 text-[15px] font-semibold transition active:scale-95 disabled:opacity-30">Edit Profile</button>
        </div>
        <ProfileNavigation />
        {children}
      </div>
    </>
  )
}

export default UserProfileLayout
