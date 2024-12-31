'use client'

import { useRouter } from 'next/router'
import { useRef } from 'react'

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/DropdownMenu'

import Avatar from './Avatar'

const ProfileImageDropdown = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleUploadButtonClick = () => {
    fileInputRef?.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // const result = await uploadProfileImage(file)
      const result = { success: true, error: null }

      if (result.success) {
        router.reload()
      } else {
        console.error(result.error)
      }
    }
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger className="mb-2">
        {/* {trigger} */}
        <Avatar size="md" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" alignOffset={0} sideOffset={2} className="w-60 origin-top-right text-[15px] dark:bg-gray-2">
        <DropdownMenuItem asChild className="w-full leading-none">
          <form>
            <button type="button" onClick={handleUploadButtonClick}>
              Upload a picture
            </button>
            <input ref={fileInputRef} type="file" name="profile-img" onChange={handleFileChange} className="hidden" />
          </form>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="h-[0.25px] dark:bg-gray-6" />
        <DropdownMenuItem asChild className="w-full leading-none text-error-text dark:focus:text-error-text"><button type="button">Remove current picture</button></DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileImageDropdown
