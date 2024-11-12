import { BaseTemplate } from '@/templates/BaseTemplate'

export default async function DashboardLayout(props: { children: React.ReactNode }) {
  // const user = await currentUser()
  return (
    <BaseTemplate>
      {props.children}
    </BaseTemplate>
  )
}

// export const dynamic = 'force-dynamic'
