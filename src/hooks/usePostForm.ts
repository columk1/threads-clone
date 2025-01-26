import { useCallback, useState } from 'react'

import { MAX_CHARACTERS } from '@/lib/constants'
import { isTextWithinRange } from '@/utils/string/isWithinRange'

export const usePostForm = () => {
  const [text, setText] = useState('')
  const isTextValid = isTextWithinRange(text, MAX_CHARACTERS)

  const handleTextInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target
    if (target instanceof HTMLTextAreaElement) {
      target.style.height = 'auto'
      target.style.height = `${target.scrollHeight}px`
    }
    setText(target.value)
  }, [])

  return {
    text,
    setText,
    isTextValid,
    handleTextInput,
  }
}
