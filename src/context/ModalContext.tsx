'use client'

import { createContext, useMemo, useState } from 'react'

type ModalType = 'new-thread' | 'login'

type ModalContextType = {
  isOpen: boolean
  modalType: ModalType | null
  // loginAction: LoginAction | null
  openModal: (type: ModalType) => void
  closeModal: () => void
  handleOpenChange: (open: boolean) => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [modalType, setModalType] = useState<ModalType | null>(null)
  // const [loginAction, setLoginAction] = useState<LoginAction | null>(null)

  const openModal = (type: ModalType) => {
    setIsOpen(true)
    setModalType(type)
    // if (type === 'login' && action) {
    //   setLoginAction(action)
    // }
  }

  const closeModal = () => {
    setIsOpen(false)
    setModalType(null)
    // setLoginAction(null)
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setModalType(null)
      // setLoginAction(null)
    }
  }

  const value = useMemo(
    () => ({ isOpen, modalType, openModal, closeModal, handleOpenChange }),
    [isOpen, modalType],
  )

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  )
}

// type ModalState = {
//   isOpen: boolean
//   modalType: ModalType | null
//   loginAction: LoginAction | null
// }

// const [modalState, setModalState] = useState<ModalState>({
//   isOpen: false,
//   modalType: null,
//   loginAction: null
// })

// const openModal = (type: ModalType, action?: LoginAction) => {
//   setModalState({
//     isOpen: true,
//     modalType: type,
//     loginAction: type === 'login' ? action : null
//   })
// }

// const closeModal = () => {
//   setModalState({
//     isOpen: false,
//     modalType: null,
//     loginAction: null
//   })
// }

// const handleOpenChange = (open: boolean) => {
//   setModalState(prev => ({
//     ...prev,
//     isOpen: open,
//     modalType: open ? prev.modalType : null,
//     loginAction: open ? prev.loginAction : null
//   }))
// }

export { ModalContext, ModalProvider }
