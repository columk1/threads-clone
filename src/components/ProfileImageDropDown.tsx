'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'

import { updateAvatar } from '@/app/actions'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/DropdownMenu'
import { IMG_UPLOAD_URL } from '@/constants/cloudinaryURL'
import { signUploadForm } from '@/lib/data'
import { stringToSafePublicId } from '@/utils/stringToSafePublicId'

import Avatar from './Avatar'

const ProfileImageDropdown = ({ username, avatarUrl }: { username: string; avatarUrl: string | null }) => {
  const [avatar, setAvatar] = useState(avatarUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // const clearPosts = useAppStore(s => s.clearPosts)

  const handleUploadButtonClick = () => {
    fileInputRef?.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // e.target.blur()
    const file = e.target.files?.[0]
    if (file) {
      const optimisticUrl = URL.createObjectURL(file)
      setAvatar(optimisticUrl)

      const options = {
        eager: 'c_fit,h_250,w_250',
        folder: 'threads-clone/avatars',
        public_id: stringToSafePublicId(username),
        overwrite: 'true',
      }

      const signData = await signUploadForm(options)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('api_key', signData.apiKey)
      formData.append('timestamp', signData.timestamp)
      formData.append('signature', signData.signature)
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, value)
      })

      const res = await fetch(IMG_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()

      // clearPosts()
      const result = await updateAvatar(data.secure_url)

      if (result.error) {
        setAvatar(avatarUrl)
        toast(result.error)
      }
    }
  }

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className="mb-2">
          {/* {trigger} */}
          <Avatar size="md" url={avatar} />
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          alignOffset={0}
          sideOffset={2}
          className="w-60 origin-top-right text-[15px] dark:bg-gray-2"
        >
          <DropdownMenuItem asChild className="w-full leading-none">
            <button type="button" onClick={handleUploadButtonClick}>
              Upload a picture
            </button>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="h-[0.25px] dark:bg-gray-6" />
          <DropdownMenuItem asChild className="w-full leading-none text-error-text dark:focus:text-error-text">
            <button type="button">Remove current picture</button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <form>
        <input ref={fileInputRef} type="file" name="profile-img" onChange={handleFileChange} className="hidden" />
      </form>
    </>
  )
}

export default ProfileImageDropdown
