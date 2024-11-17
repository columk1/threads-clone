import NewThreadModal from '@/components/NewThreadModal'
import { validateRequest } from '@/libs/Lucia'
import { BaseTemplate } from '@/templates/BaseTemplate'

export default async function DashboardLayout(props: { children: React.ReactNode }) {
  const { user } = await validateRequest()
  return (
    <BaseTemplate>
      <NewThreadModal username={user?.username} />
      {props.children}
    </BaseTemplate>
  )
}

// export const dynamic = 'force-dynamic'
