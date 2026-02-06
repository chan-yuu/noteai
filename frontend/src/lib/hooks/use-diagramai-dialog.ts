'use client'

import { create } from 'zustand'

interface DiagramAIStore {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useDiagramAIDialog = create<DiagramAIStore>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),
}))
