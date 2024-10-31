import { redirect } from 'next/navigation'

import { Hello } from '@/components/Hello'
import { validateRequest } from '@/libs/Lucia'

export async function generateMetadata() {
  return {
    title: 'Dashboard',
  }
}

const Dashboard = async () => {
  const { user } = await validateRequest()
  const userExists = user && user.emailVerified
  if (!userExists) {
    return redirect('/login')
  }

  return (
    <Hello />
  )
}

export default Dashboard
