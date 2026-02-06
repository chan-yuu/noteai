'use client'

import { create } from 'zustand'

interface VideoDialogStore {
    isOpen: boolean
    open: () => void
    close: () => void
    toggle: () => void
}

export const useVideoDialog = create<VideoDialogStore>((set) => ({
    isOpen: false,
    open: () => set({ isOpen: true }),
    close: () => set({ isOpen: false }),
    toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
