// 'use client'

import { createContext } from 'node:vm'

import React, { type ReactNode } from 'react'
import { createStore, type StoreApi } from 'zustand/vanilla'

export type SessionState = {
  user: {
    username?: string
    avatar?: string | null
  }
}

export type SessionActions = {
  updateAvatar: (url: string) => void
  deleteAvatar: () => void
}

export type SessionStore = SessionState & SessionActions

export type SessionStoreApi = StoreApi<SessionStore>

export type SessionStoreProviderProps = {
  children: ReactNode
  initialSession: SessionState
}

const SessionStoreContext = createContext(undefined)

export const SessionStoreProvider = ({ children, initialSession }: SessionStoreProviderProps) => {
  const [store] = React.useState(() =>
    createStore<SessionStore>()((set) => ({
      ...initialSession,
      updateAvatar: (url: string) => set((state) => ({ user: { ...state.user, avatar: url } })),
      deleteAvatar: () => set((state) => ({ user: { ...state.user, avatar: null } })),
    })),
  )

  return <SessionStoreContext.Provider value={store}>{children}</SessionStoreContext.Provider>
}
