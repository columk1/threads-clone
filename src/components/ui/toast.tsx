import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'
import { toast } from 'sonner'

import { CustomToast as Toast } from '@/components/CustomToast'
import { CheckmarkIcon } from '@/components/icons'
import Spinner from '@/components/Spinner/Spinner'

type ShowPostSuccessToastParams = {
  router: AppRouterInstance
  username: string
  postId?: string
}

export const showPostSuccessToast = ({ router, username, postId }: ShowPostSuccessToastParams) => {
  const id = toast(<Toast text="Posting..." icon={<Spinner />} />)
  setTimeout(
    () =>
      toast(
        <Toast text="Posted" icon={<CheckmarkIcon />}>
          <button type="button" onClick={() => router.push(`/@${username}/post/${postId}`)}>
            View
          </button>
        </Toast>,
        { id },
      ),
    500,
  )
}
