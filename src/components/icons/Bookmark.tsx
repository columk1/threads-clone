import type { FunctionComponent } from 'react'

type BookmarkProps = {
  className?: string
}

const Bookmark: FunctionComponent<BookmarkProps> = ({ className }) => {
  return (
    <svg aria-label="Save" role="img" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" height="20px" width="20px" className={className}>
      <title>Save</title>
      <path d="M3.40039 17.7891V3.94995C3.40039 2.43117 4.6316 1.19995 6.15039 1.19995H13.8448C15.3636 1.19995 16.5948 2.43117 16.5948 3.94995V17.6516C16.5948 18.592 15.4579 19.063 14.7929 18.398L10.6201 14.2252C10.4198 14.0249 10.097 14.0184 9.88889 14.2106L5.17191 18.5647C4.49575 19.1888 3.40039 18.7093 3.40039 17.7891Z"></path>
    </svg>
  )
}

export default Bookmark
