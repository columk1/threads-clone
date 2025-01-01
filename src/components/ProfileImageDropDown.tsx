'use client'

import { useRouter } from 'next/navigation'
import { useRef } from 'react'

import { updateAvatar } from '@/app/actions'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/DropdownMenu'

import Avatar from './Avatar'

const url = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`

const ProfileImageDropdown = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleUploadButtonClick = () => {
    fileInputRef?.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'threads_preset')

      const res = await fetch(url, {
        method: 'POST',
        body: formData,
      })
      // console.log('res:', res)
      const data = await res.json()

      const result = await updateAvatar(data.secure_url)
      // const result = { success: true, error: null }

      if (result.success) {
        router.refresh()
      } else {
        console.error(result.error)
      }
    }
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="mb-2">
          {/* {trigger} */}
          <Avatar size="md" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" alignOffset={0} sideOffset={2} className="w-60 origin-top-right text-[15px] dark:bg-gray-2">
          <DropdownMenuItem asChild className="w-full leading-none">
            <button type="button" onClick={handleUploadButtonClick}>
              Upload a picture
            </button>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="h-[0.25px] dark:bg-gray-6" />
          <DropdownMenuItem asChild className="w-full leading-none text-error-text dark:focus:text-error-text"><button type="button">Remove current picture</button></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <form>
        <input ref={fileInputRef} type="file" name="profile-img" onChange={handleFileChange} className="hidden" />
      </form>
    </>
  )
}

export default ProfileImageDropdown
