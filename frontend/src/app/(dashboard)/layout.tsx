'use client'

import { useAuth } from '@/lib/hooks/use-auth'
import { useVersionCheck } from '@/lib/hooks/use-version-check'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { ModalProvider } from '@/components/providers/ModalProvider'
import { CreateDialogsProvider } from '@/lib/hooks/use-create-dialogs'
import { CommandPalette } from '@/components/common/CommandPalette'
import { DiagramAIDialog } from '@/components/diagramai/DiagramAIDialog'
import { useDiagramAIDialog } from '@/lib/hooks/use-diagramai-dialog'
import { DiagramProvider } from '@/contexts/diagram-context'
import { DictionaryProvider } from '@/lib/hooks/diagramai/use-dictionary'

// 动态加载字典
async function loadDictionary(locale: string) {
  const dictionaries: Record<string, () => Promise<any>> = {
    en: () => import('@/lib/diagramai/i18n/dictionaries/en.json').then(m => m.default),
    zh: () => import('@/lib/diagramai/i18n/dictionaries/zh.json').then(m => m.default),
    ja: () => import('@/lib/diagramai/i18n/dictionaries/ja.json').then(m => m.default),
  }
  
  return await dictionaries[locale]()
}

function DiagramAIWrapper() {
  const { isOpen, close } = useDiagramAIDialog()
  const [dictionary, setDictionary] = useState<any>(null)

  useEffect(() => {
    if (isOpen && !dictionary) {
      const locale = localStorage.getItem('diagram-ai-locale') || 'en'
      loadDictionary(locale).then(setDictionary)
    }
  }, [isOpen, dictionary])

  if (!isOpen || !dictionary) return null

  return (
    <DictionaryProvider dictionary={dictionary}>
      <DiagramProvider>
        <DiagramAIDialog open={isOpen} onOpenChange={(open) => !open && close()} />
      </DiagramProvider>
    </DictionaryProvider>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  // Check for version updates once per session
  useVersionCheck()

  useEffect(() => {
    // Mark that we've completed the initial auth check
    if (!isLoading) {
      setHasCheckedAuth(true)

      // Redirect to login if not authenticated
      if (!isAuthenticated) {
        // Store the current path to redirect back after login
        const currentPath = window.location.pathname + window.location.search
        sessionStorage.setItem('redirectAfterLogin', currentPath)
        router.push('/login')
      }
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading spinner during initial auth check or while loading
  if (isLoading || !hasCheckedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  // Don't render anything if not authenticated (during redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <ErrorBoundary>
      <CreateDialogsProvider>
        {children}
        <ModalProvider />
        <CommandPalette />
        <DiagramAIWrapper />
      </CreateDialogsProvider>
    </ErrorBoundary>
  )
}
