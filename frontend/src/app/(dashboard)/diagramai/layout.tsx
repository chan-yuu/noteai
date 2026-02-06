import { getDictionary } from '@/lib/diagramai/i18n/dictionaries'
import { ClientProviders } from './client-providers'

export default async function DiagramAILayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 服务端渲染时使用英语字典作为初始值
  // 客户端会根据 localStorage 动态切换
  const dictionary = await getDictionary('en')
  
  return (
    <ClientProviders initialDictionary={dictionary} initialLocale="en">
      {children}
    </ClientProviders>
  )
}
