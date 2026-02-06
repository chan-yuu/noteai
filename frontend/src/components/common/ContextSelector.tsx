'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, Search, Database, Book } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { useTranslation } from '@/lib/hooks/use-translation'
import { useNotebooks } from '@/lib/hooks/use-notebooks'
import { useSources } from '@/lib/hooks/use-sources'

export interface ContextItem {
    id: string
    type: 'notebook' | 'source'
    label: string
}

interface ContextSelectorProps {
    selectedIds: string[]
    onSelectionChange: (ids: string[]) => void
    className?: string
}

export function ContextSelector({
    selectedIds,
    onSelectionChange,
    className,
}: ContextSelectorProps) {
    const { t } = useTranslation()
    const [open, setOpen] = React.useState(false)

    // Fetch data
    const { data: notebooks, isLoading: isLoadingNotebooks } = useNotebooks()
    const { data: sources, isLoading: isLoadingSources } = useSources()

    // Process selected items for display
    const selectedItems = React.useMemo(() => {
        const items: ContextItem[] = []

        selectedIds.forEach(id => {
            const [type, actualId] = id.split(':')
            if (type === 'notebook') {
                const nb = notebooks?.find((n: any) => n.id === actualId)
                if (nb) items.push({ id, type: 'notebook', label: nb.name })
            } else if (type === 'source') {
                const src = sources?.find((s: any) => s.id === actualId)
                if (src) items.push({ id, type: 'source', label: src.title || t.podcast.context.untitledSource })
            }
        })

        return items
    }, [selectedIds, notebooks, sources, t])

    const handleSelect = (id: string) => {
        const newSelectedIds = selectedIds.includes(id)
            ? selectedIds.filter(selectedId => selectedId !== id)
            : [...selectedIds, id]
        onSelectionChange(newSelectedIds)
    }

    const isLoading = isLoadingNotebooks || isLoadingSources

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <Popover open={open} onOpenChange={setOpen} modal={true}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between min-h-[44px] h-auto"
                    >
                        <div className="flex flex-wrap gap-1 items-center text-left">
                            {selectedItems.length > 0 ? (
                                selectedItems.map((item) => (
                                    <Badge
                                        key={item.id}
                                        variant="secondary"
                                        className="mr-1 mb-0.5 max-w-[200px] truncate"
                                    >
                                        {item.type === 'notebook' ? <Book className="h-3 w-3 mr-1" /> : <Database className="h-3 w-3 mr-1" />}
                                        {item.label}
                                    </Badge>
                                ))
                            ) : (
                                <span className="text-muted-foreground font-normal">
                                    {t.podcast.context.placeholder}
                                </span>
                            )}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder={t.common.search} />
                        <CommandList>
                            <CommandEmpty>{t.podcast.context.empty}</CommandEmpty>

                            <CommandGroup heading={t.notebooks.title}>
                                {isLoadingNotebooks ? (
                                    <CommandItem disabled>{t.common.loading}</CommandItem>
                                ) : (
                                    notebooks?.map((notebook: any) => {
                                        const id = `notebook:${notebook.id}`
                                        const isSelected = selectedIds.includes(id)
                                        return (
                                            <CommandItem
                                                key={id}
                                                // value must act as the search key. Include name and id.
                                                value={`${notebook.name}___notebook___${notebook.id}`}
                                                onSelect={() => handleSelect(id)}
                                            >
                                                <div className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                    isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                                )}>
                                                    <Check className={cn("h-4 w-4")} />
                                                </div>
                                                <Book className="mr-2 h-4 w-4 text-muted-foreground" />
                                                <span className="truncate">{notebook.name}</span>
                                            </CommandItem>
                                        )
                                    })
                                )}
                            </CommandGroup>

                            <CommandSeparator />

                            <CommandGroup heading={t.navigation.sources}>
                                {isLoadingSources ? (
                                    <CommandItem disabled>{t.common.loading}</CommandItem>
                                ) : (
                                    sources?.map((source: any) => {
                                        const id = `source:${source.id}`
                                        const isSelected = selectedIds.includes(id)
                                        return (
                                            <CommandItem
                                                key={id}
                                                value={`${source.title || t.podcast.context.untitledSource}___source___${source.id}`}
                                                onSelect={() => handleSelect(id)}
                                            >
                                                <div className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                    isSelected ? "bg-primary text-primary-foreground" : "opacity-50 [&_svg]:invisible"
                                                )}>
                                                    <Check className={cn("h-4 w-4")} />
                                                </div>
                                                <Database className="mr-2 h-4 w-4 text-muted-foreground" />
                                                <span className="truncate">{source.title || t.podcast.context.untitledSource}</span>
                                            </CommandItem>
                                        )
                                    })
                                )}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            {selectedItems.length > 0 && (
                <p className="text-xs text-muted-foreground">
                    {selectedItems.length} items selected. Content will be used as context.
                </p>
            )}
        </div>
    )
}
