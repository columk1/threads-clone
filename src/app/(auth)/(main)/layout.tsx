import Link from 'next/link'

import { BaseTemplate } from '@/templates/BaseTemplate'

export default async function DashboardLayout(props: { children: React.ReactNode }) {
  // const user = await currentUser()
  return (
    <BaseTemplate
      leftNav={(
        <>
          <li>
            <Link
              href="/"
              className="border-none text-gray-700 hover:text-gray-900"
            >
              Dashboard
            </Link>
          </li>
          {/* <li>
            <Link
              href={`/${user?.username}/`}
              className="border-none text-gray-700 hover:text-gray-900"
            >
              Manage your account
            </Link>
          </li> */}
        </>
      )}
      rightNav={(
        <li>
          <button className="border-none text-gray-700 hover:text-gray-900" type="button">
            Sign out
          </button>
        </li>
      )}
    >
      {props.children}
    </BaseTemplate>
  )
}

// export const dynamic = 'force-dynamic'
