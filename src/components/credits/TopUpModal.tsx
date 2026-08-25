'use client'

import { useState } from 'react'
import { X, Loader2, Coins, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TopUpModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TopUpModal({ isOpen, onClose }: TopUpModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  if (!isOpen) return null

  const handleDevTopUp = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/credits/topup-dev', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to top up')
      
      setSuccess(true)
      setTimeout(() => {
        router.refresh()
        onClose()
        setSuccess(false)
      }, 1500)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-500" />
            Top Up Credits
          </h3>
          <button 
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div className="text-center mb-4">
            <h4 className="text-zinc-900 dark:text-zinc-100 font-semibold mb-2">Need more credits?</h4>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Generating outfits and adding items requires credits. Choose a package below.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {[25, 75, 200].map(amount => (
              <button
                key={amount}
                disabled
                className="w-full flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-emerald-500 dark:hover:border-emerald-500 opacity-60 cursor-not-allowed transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-50 dark:bg-emerald-950/50 p-2 rounded-lg">
                    <Coins className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{amount} Credits</span>
                </div>
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Coming Soon</span>
              </button>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <button
              onClick={handleDevTopUp}
              disabled={isLoading || success}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${
                success 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' 
                  : 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:scale-[1.02]'
              }`}
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {!isLoading && !success && 'Sandbox: Add 20 Test Credits'}
              {success && <CheckCircle2 className="w-5 h-5" />}
              {success && 'Credits Added!'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
