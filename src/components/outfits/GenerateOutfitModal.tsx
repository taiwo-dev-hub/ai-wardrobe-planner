'use client'

import { useState } from 'react'
import { X, Loader2, Sparkles, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface GenerateOutfitModalProps {
  isOpen: boolean
  onClose: () => void
  credits: number
}

const VIBES = ['Normal / Everyday', 'Bold & Outlandish', 'Smart Casual', 'Streetwear', 'Formal']

export function GenerateOutfitModal({ isOpen, onClose, credits }: GenerateOutfitModalProps) {
  const [selectedVibe, setSelectedVibe] = useState(VIBES[0])
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  if (!isOpen) return null

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (credits <= 0) {
      setError("You don't have enough credits.")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/outfits/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vibe: selectedVibe, prompt }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate outfit')
      }

      router.refresh()
      onClose()
      setPrompt('')
    } catch (err: any) {
      setError(err.message || 'An error occurred during generation.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            Plan Your Look
          </h3>
          <button 
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="p-6 flex flex-col gap-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400 rounded-xl flex items-start gap-2 border border-red-200 dark:border-red-900/50">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">
              Select a Vibe
            </label>
            <div className="flex flex-wrap gap-2">
              {VIBES.map(vibe => (
                <button
                  key={vibe}
                  type="button"
                  onClick={() => setSelectedVibe(vibe)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedVibe === vibe
                      ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-md transform scale-[1.02]'
                      : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'
                  }`}
                >
                  {vibe}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="prompt" className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
              Custom Prompt <span className="font-normal text-zinc-500">(Optional)</span>
            </label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Needs to feel cozy for a coffee run"
              rows={3}
              className="block w-full rounded-2xl border-0 py-3 px-4 text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 shadow-sm ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:focus:ring-indigo-500 sm:text-sm sm:leading-6 transition-all resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800 mt-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-0.5">Balance</span>
              <span className={`text-sm font-bold ${credits > 0 ? 'text-zinc-900 dark:text-zinc-100' : 'text-red-500'}`}>
                {credits} Credits
              </span>
            </div>
            <button
              type="submit"
              disabled={isGenerating || credits <= 0}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-md hover:bg-indigo-500 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
            >
              {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
              {isGenerating ? 'Styling...' : 'Generate Outfit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
