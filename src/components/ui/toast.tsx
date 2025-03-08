import { redirect } from 'next/navigation'
import { toast } from 'sonner'

import { CustomToast as Toast } from '@/components/CustomToast'
import { CheckmarkIcon } from '@/components/icons'
import Spinner from '@/components/Spinner/Spinner'

type ShowPostSuccessToastParams = {
  username: string
  postId?: string
}

export const showPostSuccessToast = ({ username, postId }: ShowPostSuccessToastParams) => {
  const id = toast(<Toast text="Posting..." icon={<Spinner />} />)
  setTimeout(
    () =>
      toast(
        <Toast text="Posted" icon={<CheckmarkIcon />}>
          <button
            type="button"
            onClick={() => {
              redirect(`/@${username}/post/${postId}`)
            }}
          >
            View
          </button>
        </Toast>,
        { id },
      ),
    500,
  )
}
