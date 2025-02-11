import { notFound } from 'next/navigation'

import { ContentPane } from '@/components/ContentPane'
import CurrentUserProfile from '@/components/CurrentUserProfile'
import Header from '@/components/Header'
import VisitorProfile from '@/components/UserProfile'
import { validateRequest } from '@/lib/Lucia'
import { usernameParamSchema } from '@/lib/schemas/zod.schema'
import { getPublicUserInfo, getUserInfo, type PostUser } from '@/services/users/users.queries'

type Props = {
  params: Promise<{ username: string }>
  children: React.ReactNode
}

type UserInfo = { user: PostUser } | { error: string }

const fetchUserInfo = async (isCurrentUser: boolean, username: string): Promise<UserInfo> => {
  if (isCurrentUser) {
    return await getUserInfo(username)
  } else {
    return await getPublicUserInfo(username)
  }
}

export async function generateMetadata({ params }: Props) {
  const { username } = await params
  const result = usernameParamSchema.safeParse(username)
  if (!result.success) {
    return notFound()
  }
  const { user: currentUser } = await validateRequest()

  const res = await fetchUserInfo(!!currentUser, result.data)
  if ('error' in res) {
    return notFound()
  }
  return {
    title: `${res.user.username}`,
  }
}

const UserProfileLayout = async ({ params, children }: Props) => {
  const { username } = await params
  const result = usernameParamSchema.safeParse(username)
  if (!result.success) {
    return notFound()
  }

  const { user: currentUser } = await validateRequest()

  const res = await fetchUserInfo(!!currentUser, result.data)
  if ('error' in res) {
    return notFound()
  }

  const user = res.user
  // Branch for public user page
  if (currentUser?.username !== user.username) {
    return (
      <>
        <Header title={`${user.username}`} />
        <ContentPane>
          <VisitorProfile initialUser={user}>{children}</VisitorProfile>
        </ContentPane>
      </>
    )
  }

  if (!('isFollowed' in user)) {
    return notFound()
  }

  // Branch for current user's profile
  return (
    <>
      <Header title="Profile" />
      <ContentPane>
        <CurrentUserProfile user={user}>{children}</CurrentUserProfile>
      </ContentPane>
    </>
  )
}

export default UserProfileLayout
