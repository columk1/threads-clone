'use client'

import { createContext, useMemo, useState } from 'react'

import type { GatedAction } from '@/hooks/useModal'

type ModalType = 'new-thread' | 'auth-prompt'

type ModalContextType = {
  isOpen: boolean
  modalType: ModalType | null
  gatedAction: GatedAction | null
  openModal: (type: ModalType, action?: GatedAction) => void
  closeModal: () => void
  handleOpenChange: (open: boolean) => void
}

type ModalState = {
  isOpen: boolean
  modalType: ModalType | null
  gatedAction: GatedAction | null
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    modalType: null,
    gatedAction: null,
  })

  const openModal: ModalContextType['openModal'] = (type, action) => {
    setModalState({
      isOpen: true,
      modalType: type,
      gatedAction: type === 'auth-prompt' && action ? action : null,
    })
  }

  const closeModal = () => {
    setModalState({
      isOpen: false,
      modalType: null,
      gatedAction: null,
    })
  }

  const handleOpenChange = (open: boolean) => {
    setModalState(prev => ({
      ...prev,
      isOpen: open,
      modalType: open ? prev.modalType : null,
      loginAction: open ? prev.gatedAction : null,
    }))
  }

  const value = useMemo(
    () => ({ isOpen: modalState.isOpen, modalType: modalState.modalType, gatedAction: modalState.gatedAction, openModal, closeModal, handleOpenChange }),
    [modalState],
  )

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  )
}

export { ModalContext, ModalProvider }
