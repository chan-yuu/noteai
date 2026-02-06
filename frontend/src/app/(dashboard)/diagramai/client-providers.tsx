'use client'

import { useEffect, useState } from 'react'
import { DiagramProvider } from '@/contexts/diagram-context'
import { DictionaryProvider } from '@/lib/hooks/diagramai/use-dictionary'
import type { Dictionary } from '@/lib/diagramai/i18n/dictionaries'
import type { Locale } from '@/lib/diagramai/i18n/config'

// 从服务端加载字典
async function loadDictionary(locale: Locale): Promise<Dictionary> {
  // 动态导入对应语言的字典 JSON
  const dictionaries = {
    en: () => import('@/lib/diagramai/i18n/dictionaries/en.json').then(m => m.default),
    zh: () => import('@/lib/diagramai/i18n/dictionaries/zh.json').then(m => m.default),
    ja: () => import('@/lib/diagramai/i18n/dictionaries/ja.json').then(m => m.default),
  }
  
  return await dictionaries[locale]() as Dictionary
}

interface ClientProvidersProps {
  children: React.ReactNode
  initialDictionary: Dictionary
  initialLocale: Locale
}

export function ClientProviders({ children, initialDictionary, initialLocale }: ClientProvidersProps) {
  const [dictionary, setDictionary] = useState<Dictionary>(initialDictionary)
  const [currentLocale, setCurrentLocale] = useState<Locale>(initialLocale)

  // 监听 localStorage 中的语言变化
  useEffect(() => {
    const checkLocale = () => {
      const stored = localStorage.getItem('diagram-ai-locale') as Locale | null
      if (stored && stored !== currentLocale) {
        loadDictionary(stored).then(dict => {
          setDictionary(dict)
          setCurrentLocale(stored)
        })
      }
    }

    // 初始检查
    checkLocale()

    // 监听 storage 事件(跨标签页同步)
    window.addEventListener('storage', checkLocale)
    
    // 监听自定义语言切换事件
    const handleLocaleChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ locale: Locale }>
      const newLocale = customEvent.detail.locale
      if (newLocale !== currentLocale) {
        loadDictionary(newLocale).then(dict => {
          setDictionary(dict)
          setCurrentLocale(newLocale)
        })
      }
    }
    
    window.addEventListener('diagramai-locale-change', handleLocaleChange)

    return () => {
      window.removeEventListener('storage', checkLocale)
      window.removeEventListener('diagramai-locale-change', handleLocaleChange)
    }
  }, [currentLocale])

  return (
    <DictionaryProvider dictionary={dictionary}>
      <DiagramProvider>{children}</DiagramProvider>
    </DictionaryProvider>
  )
}
