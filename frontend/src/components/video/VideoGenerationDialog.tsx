'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import {
    Loader2,
    Video,
    Image as ImageIcon,
    Type,
    Play,
    FileVideo,
    AlertCircle,
    Download,
    History,
    Sparkles
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useTranslation } from '@/lib/hooks/use-translation'
import { ContextSelector } from '@/components/common/ContextSelector'

interface VideoJob {
    id: string
    type: string
    prompt: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    created_at: string
    output_url?: string
    error?: string
    image_path?: string
}

interface VideoGenerationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function VideoGenerationDialog({ open, onOpenChange }: VideoGenerationDialogProps) {
    const { t } = useTranslation()
    const [activeTab, setActiveTab] = useState<string>('t2v-A14B')
    const [prompt, setPrompt] = useState('')
    const [contextIds, setContextIds] = useState<string[]>([])
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [jobs, setJobs] = useState<VideoJob[]>([])
    const [error, setError] = useState<string | null>(null)

    // Polling for jobs
    useEffect(() => {
        if (open) {
            fetchJobs()
            const interval = setInterval(fetchJobs, 5000)
            return () => clearInterval(interval)
        }
    }, [open])

    const fetchJobs = async () => {
        try {
            const response = await fetch('/api/video/jobs')
            if (response.ok) {
                const data = await response.json()
                setJobs(data)
            }
        } catch (err) {
            console.error('Failed to fetch jobs', err)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(null)

        try {
            const formData = new FormData()
            formData.append('prompt', prompt)
            formData.append('type', activeTab)
            formData.append('context_ids', JSON.stringify(contextIds))

            if (activeTab === 'i2v-A14B' && imageFile) {
                formData.append('image', imageFile)
            } else if (activeTab === 'i2v-A14B' && !imageFile) {
                throw new Error('Please select an image for Image-to-Video generation.')
            }

            const response = await fetch('/api/video/generate', {
                method: 'POST',
                body: formData,
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || 'Failed to start generation')
            }

            // Reset form and fetch jobs
            setPrompt('')
            setContextIds([])
            setImageFile(null)
            fetchJobs()

        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFile(e.target.files[0])
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[95vw] max-h-[95vh] h-[95vh] p-0 overflow-hidden flex flex-col gap-0">
                <DialogTitle className="sr-only">{t.video.title}</DialogTitle>
                <div className="flex flex-1 h-full overflow-hidden">
                    {/* Left Panel - Controls */}
                    <div className="w-1/3 border-r bg-muted/10 p-6 flex flex-col overflow-y-auto">
                        <div className="mb-6">
                            <h2 className="text-2xl font-semibold flex items-center gap-2 mb-2">
                                <Sparkles className="h-6 w-6 text-primary" />
                                {t.video.title}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {t.video.description}
                            </p>
                        </div>

                        <Tabs defaultValue="t2v-A14B" value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                            <TabsList className="grid w-full grid-cols-3 mb-6">
                                <TabsTrigger value="t2v-A14B" className="text-xs">T2V (14B)</TabsTrigger>
                                <TabsTrigger value="ti2v-5B" className="text-xs">T2V (5B)</TabsTrigger>
                                <TabsTrigger value="i2v-A14B" className="text-xs">I2V (14B)</TabsTrigger>
                            </TabsList>

                            <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
                                <div className="space-y-3">
                                    <Label className="text-sm font-medium">{t.video.context.label}</Label>
                                    <ContextSelector
                                        selectedIds={contextIds}
                                        onSelectionChange={setContextIds}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <Label htmlFor="prompt" className="text-sm font-medium">{t.video.promptLabel}</Label>
                                    <Textarea
                                        id="prompt"
                                        placeholder={t.video.promptPlaceholder}
                                        className="min-h-[160px] resize-none focus-visible:ring-primary"
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        required
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        {t.video.tip}
                                    </p>
                                </div>

                                <TabsContent value="i2v-A14B" className="space-y-3 mt-0 data-[state=inactive]:hidden">
                                    <div className="space-y-3">
                                        <Label htmlFor="image">{t.video.sourceImage}</Label>
                                        <div className="border-2 border-dashed rounded-lg p-4 hover:bg-muted/50 transition-colors text-center cursor-pointer relative">
                                            <Input
                                                id="image"
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                            {imageFile ? (
                                                <div className="relative aspect-video w-full overflow-hidden rounded-md border shadow-sm">
                                                    <img
                                                        src={URL.createObjectURL(imageFile)}
                                                        alt="Preview"
                                                        className="object-cover w-full h-full"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-4 text-muted-foreground">
                                                    <ImageIcon className="h-8 w-8 mb-2 opacity-50" />
                                                    <span className="text-xs">{t.video.uploadPlaceholder}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </TabsContent>

                                <div className="mt-auto pt-4 space-y-4">
                                    {error && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>{t.common.error}</AlertTitle>
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}

                                    <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting} size="lg">
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                {t.video.generating}
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="mr-2 h-4 w-4" />
                                                {t.video.generate}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Tabs>
                    </div>

                    {/* Right Panel - Results/History */}
                    <div className="w-2/3 bg-background flex flex-col">
                        <div className="p-6 border-b flex items-center justify-between">
                            <h3 className="font-semibold flex items-center gap-2">
                                <History className="h-5 w-5" /> {t.video.history}
                            </h3>
                            <Badge variant="outline" className="font-normal">
                                {jobs.length} {t.video.videos}
                            </Badge>
                        </div>

                        <ScrollArea className="flex-1 p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                                {jobs.length === 0 ? (
                                    <div className="col-span-full h-[50vh] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl m-4">
                                        <Video className="h-16 w-16 mb-4 opacity-20" />
                                        <p className="text-lg font-medium">{t.video.noVideos}</p>
                                        <p className="text-sm">{t.video.startCreating}</p>
                                    </div>
                                ) : (
                                    jobs.map((job) => (
                                        <Card key={job.id} className="overflow-hidden group border-muted shadow-sm hover:shadow-md transition-all">
                                            <CardContent className="p-0">
                                                <div className="aspect-video bg-black/5 relative flex items-center justify-center overflow-hidden">
                                                    {job.status === 'completed' && job.output_url ? (
                                                        <video
                                                            src={job.output_url}
                                                            controls
                                                            className="w-full h-full object-cover"
                                                            loop
                                                            poster={job.type === 'i2v-A14B' ? job.image_path : undefined} // Optional: use input image as poster if available
                                                        />
                                                    ) : (
                                                        <div className="flex flex-col items-center text-muted-foreground p-8 text-center">
                                                            {job.status === 'processing' || job.status === 'pending' ? (
                                                                <div className="flex flex-col items-center animate-pulse">
                                                                    <Loader2 className="h-10 w-10 animate-spin mb-3 text-primary" />
                                                                    <span className="text-sm font-medium">{t.video.generating}</span>
                                                                </div>
                                                            ) : job.status === 'failed' ? (
                                                                <>
                                                                    <AlertCircle className="h-10 w-10 text-destructive mb-3" />
                                                                    <span className="text-sm font-medium text-destructive">{t.video.status.failed}</span>
                                                                </>
                                                            ) : (
                                                                <FileVideo className="h-10 w-10 mb-3" />
                                                            )}
                                                        </div>
                                                    )}

                                                    {/* Status Overlay for non-completed */}
                                                    {job.status !== 'completed' && job.status !== 'failed' && (
                                                        <div className="absolute top-2 right-2">
                                                            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                                                                {job.status === 'processing' ? t.video.status.processing :
                                                                    job.status === 'pending' ? t.video.status.pending :
                                                                        job.status}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">
                                                            {job.type.replace('-A14B', '').replace('ti2v-', 'T2V ')}
                                                        </Badge>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {new Date(job.created_at).toLocaleTimeString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-foreground/80 line-clamp-2 min-h-[40px] mb-3" title={job.prompt}>
                                                        {job.prompt}
                                                    </p>

                                                    <div className="flex items-center gap-2">
                                                        {job.status === 'completed' && job.output_url && (
                                                            <Button asChild size="sm" variant="secondary" className="w-full gap-2">
                                                                <a href={job.output_url} download target="_blank" rel="noopener noreferrer">
                                                                    <Download className="h-3 w-3" /> {t.video.download}
                                                                </a>
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
