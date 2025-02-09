'use client'

import { createContext, useMemo, useState } from 'react'

import type { ProtectedAction } from '@/hooks/useModal'

type ModalType = 'new-thread' | 'auth-prompt'

type ModalContextType = {
  isOpen: boolean
  modalType: ModalType | null
  protectedAction: ProtectedAction | null
  openModal: (type: ModalType, action?: ProtectedAction) => void
  closeModal: () => void
  handleOpenChange: (open: boolean) => void
}

type ModalState = {
  isOpen: boolean
  modalType: ModalType | null
  protectedAction: ProtectedAction | null
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    modalType: null,
    protectedAction: null,
  })

  const openModal: ModalContextType['openModal'] = (type, action) => {
    setModalState({
      isOpen: true,
      modalType: type,
      protectedAction: type === 'auth-prompt' && action ? action : null,
    })
  }

  const closeModal = () => {
    setModalState({
      isOpen: false,
      modalType: null,
      protectedAction: null,
    })
  }

  const handleOpenChange = (open: boolean) => {
    setModalState((prev) => ({
      ...prev,
      isOpen: open,
      modalType: open ? prev.modalType : null,
      loginAction: open ? prev.protectedAction : null,
    }))
  }

  const value = useMemo(
    () => ({
      isOpen: modalState.isOpen,
      modalType: modalState.modalType,
      protectedAction: modalState.protectedAction,
      openModal,
      closeModal,
      handleOpenChange,
    }),
    [modalState],
  )

  return <ModalContext value={value}>{children}</ModalContext>
}

export { ModalContext, ModalProvider }
