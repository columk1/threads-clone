'use client'

import { createContext, type Dispatch, type SetStateAction, useMemo, useState } from 'react'

type ModalContextType = {
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
}

const ModalContext = createContext<ModalContextType>({ isOpen: true, setIsOpen: () => {} })

const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(true)

  const value = useMemo(() => ({ isOpen, setIsOpen }), [isOpen])

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
}

export { ModalContext, ModalProvider }
