import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { AddSourceDialog } from '@/components/sources/AddSourceDialog'
import { CreateNotebookDialog } from '@/components/notebooks/CreateNotebookDialog'
import { useDiagramAIDialog } from '@/lib/hooks/use-diagramai-dialog'

interface CreateDialogsContextType {
  openSourceDialog: () => void
  openNotebookDialog: () => void
  openDiagramDialog: () => void
}

const CreateDialogsContext = createContext<CreateDialogsContextType | null>(null)

export function CreateDialogsProvider({ children }: { children: ReactNode }) {
  // Use duplicate global state for DiagramAI to ensure it runs within the correct Provider context (in layout.tsx)
  const { open: openGlobalDiagramDialog } = useDiagramAIDialog()

  const [sourceDialogOpen, setSourceDialogOpen] = useState(false)
  const [notebookDialogOpen, setNotebookDialogOpen] = useState(false)
  // diagramDialogOpen removed, using global store

  const openSourceDialog = useCallback(() => setSourceDialogOpen(true), [])
  const openNotebookDialog = useCallback(() => setNotebookDialogOpen(true), [])
  const openDiagramDialog = useCallback(() => openGlobalDiagramDialog(), [openGlobalDiagramDialog])

  return (
    <CreateDialogsContext.Provider
      value={{
        openSourceDialog,
        openNotebookDialog,
        openDiagramDialog,
      }}
    >
      {children}
      <AddSourceDialog open={sourceDialogOpen} onOpenChange={setSourceDialogOpen} />
      <CreateNotebookDialog open={notebookDialogOpen} onOpenChange={setNotebookDialogOpen} />
      {/* DiagramAIDialog is handled globally in layout.tsx to ensure Provider context */}
    </CreateDialogsContext.Provider>
  )
}

export function useCreateDialogs() {
  const context = useContext(CreateDialogsContext)
  if (!context) {
    throw new Error('useCreateDialogs must be used within a CreateDialogsProvider')
  }
  return context
}
