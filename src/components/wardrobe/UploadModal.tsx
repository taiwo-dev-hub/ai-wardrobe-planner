'use client'

import { useState, useRef } from 'react'
import { X, Loader2, Image as ImageIcon } from 'lucide-react'
import { removeBackground } from '@imgly/background-removal'
import { useRouter } from 'next/navigation'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UploadModal({ isOpen, onClose }: UploadModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  if (!isOpen) return null

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    await processImage(file)
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    await processImage(file)
  }

  const processImage = async (file: File) => {
    try {
      setIsProcessing(true)
      setProgress(0)
      setStatus('Removing background (this may take a moment)...')

      const blob = await removeBackground(file, {
        progress: (key, current, total) => {
          if (total) {
            setProgress(Math.round((current / total) * 100))
          }
        },
      })

      setStatus('AI is analyzing your item...')
      setProgress(0)
      
      const formData = new FormData()
      formData.append('image', blob, 'cutout.png')

      const response = await fetch('/api/wardrobe/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to upload image')
      }

      router.refresh()
      onClose()
    } catch (error: any) {
      alert(error.message || 'An error occurred during processing.')
    } finally {
      setIsProcessing(false)
      setStatus('')
      setProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Add Wardrobe Item</h3>
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg disabled:opacity-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {isProcessing ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="w-10 h-10 text-zinc-900 dark:text-zinc-100 animate-spin mb-4" />
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-2">{status}</p>
              {progress > 0 && progress < 100 && (
                <div className="w-full max-w-xs bg-zinc-200 dark:bg-zinc-800 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div 
                    className="bg-zinc-900 dark:bg-zinc-100 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-4 max-w-[250px]">
                Please do not close this window while we process your item.
              </p>
            </div>
          ) : (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-6 h-6 text-zinc-500 dark:text-zinc-400" />
              </div>
              <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-1">Click to upload or drag and drop</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">JPEG, PNG, or WebP (max. 5MB)</p>
              <input 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleFileSelect}
                className="hidden" 
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
