'use client'

import { useState } from 'react'
import { Plus, Shirt, Tag as TagIcon, Sparkles, CalendarDays, Coins, Trash2, Loader2, Calendar } from 'lucide-react'
import { UploadModal } from './UploadModal'
import { GenerateOutfitModal } from '@/components/outfits/GenerateOutfitModal'
import { OutfitCard } from '@/components/outfits/OutfitCard'
import { TopUpModal } from '@/components/credits/TopUpModal'
import { Database } from '@/types/database'
import { useRouter } from 'next/navigation'

type ClothesRow = Database['public']['Tables']['clothes']['Row']
type OutfitRow = Database['public']['Tables']['outfits']['Row']

const CATEGORIES = ['all', 'top', 'bottom', 'outerwear', 'shoes', 'accessory'] as const

interface DashboardViewProps {
  initialClothes: ClothesRow[]
  initialOutfits: OutfitRow[]
  initialCredits: number
}

export function DashboardView({ initialClothes, initialOutfits, initialCredits }: DashboardViewProps) {
  const [view, setView] = useState<'wardrobe' | 'outfits' | 'planner'>('wardrobe')
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isOutfitModalOpen, setIsOutfitModalOpen] = useState(false)
  const [isTopUpModalOpen, setIsTopUpModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<typeof CATEGORIES[number]>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isGeneratingWeekly, setIsGeneratingWeekly] = useState(false)
  
  const router = useRouter()

  const filteredClothes = activeTab === 'all' 
    ? initialClothes 
    : initialClothes.filter(item => item.category === activeTab)

  const plannerOutfits = initialOutfits.filter(o => o.style_vibe === 'Workweek Plan')
  const savedOutfits = initialOutfits.filter(o => o.style_vibe !== 'Workweek Plan')

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this item? It will be removed from your wardrobe.")) return
    
    setDeletingId(id)
    try {
      const res = await fetch(`/api/wardrobe/delete/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete item')
      router.refresh()
    } catch (err) {
      console.error(err)
      alert("Failed to delete item.")
    } finally {
      setDeletingId(null)
    }
  }

  const handleGenerateWeekly = async () => {
    if (initialCredits < 5) {
      alert("You need at least 5 credits to generate a 5-day plan.")
      setIsTopUpModalOpen(true)
      return
    }

    setIsGeneratingWeekly(true)
    try {
      const res = await fetch('/api/outfits/generate-weekly', { method: 'POST' })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to generate weekly plan')
      }
      router.refresh()
    } catch (err: any) {
      console.error(err)
      alert(err.message)
    } finally {
      setIsGeneratingWeekly(false)
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full flex flex-col min-h-screen">
      <div className="flex items-center justify-end mb-4">
        <button 
          onClick={() => setIsTopUpModalOpen(true)}
          className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-full text-sm font-bold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors shadow-sm"
        >
          <Coins className="w-4 h-4" />
          {initialCredits} Credits
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {view === 'wardrobe' ? 'My Wardrobe' : view === 'outfits' ? 'Saved Outfits' : 'Weekly Planner'}
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            {view === 'wardrobe' 
              ? 'Manage your digital closet and items.' 
              : view === 'outfits' 
              ? 'Your personalized AI-curated looks.'
              : 'Your automated 5-day workweek schedule.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl flex items-center border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <button
              onClick={() => setView('wardrobe')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === 'wardrobe' 
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              Wardrobe
            </button>
            <button
              onClick={() => setView('outfits')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                view === 'outfits' 
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              Outfits
            </button>
            <button
              onClick={() => setView('planner')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                view === 'planner' 
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              Planner
            </button>
          </div>
          
          {view === 'wardrobe' ? (
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2.5 rounded-xl font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add Item
            </button>
          ) : view === 'outfits' ? (
            <button 
              onClick={() => setIsOutfitModalOpen(true)}
              className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-indigo-500 transition-colors shadow-sm"
            >
              <Sparkles className="h-4 w-4" />
              Plan Look
            </button>
          ) : (
             <button 
              onClick={handleGenerateWeekly}
              disabled={isGeneratingWeekly}
              className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-purple-500 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isGeneratingWeekly ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}
              {isGeneratingWeekly ? 'Generating...' : 'Generate 5-Day Plan'}
            </button>
          )}
        </div>
      </div>

      {view === 'wardrobe' && (
        <>
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all ${
                  activeTab === cat 
                    ? 'bg-zinc-900 text-white shadow-sm dark:bg-zinc-100 dark:text-zinc-900' 
                    : 'bg-white text-zinc-600 hover:bg-zinc-50 border border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {initialClothes.length === 0 ? (
            <div className="mt-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-full flex items-center justify-center mb-6">
                <Shirt className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Your wardrobe is empty</h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-md mb-8">
                Start building your digital wardrobe by adding your first clothing item. Our AI will automatically categorize and tag it for you.
              </p>
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="flex items-center gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3 rounded-xl font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
              >
                <Plus className="h-5 w-5" />
                Add Your First Item
              </button>
            </div>
          ) : filteredClothes.length === 0 ? (
            <div className="py-20 text-center text-zinc-500 dark:text-zinc-400 bg-white/50 dark:bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
              No items found in this category.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {filteredClothes.map(item => (
                <div key={item.id} className="group flex flex-col bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 relative">
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={deletingId === item.id}
                    className="absolute top-2 right-2 z-30 p-1.5 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity border border-zinc-200 dark:border-zinc-800 disabled:opacity-50 shadow-sm"
                  >
                    {deletingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                  <div className="aspect-square bg-zinc-50 dark:bg-zinc-950/50 p-4 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-100/50 to-transparent dark:from-zinc-900/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={item.image_url} 
                      alt={`${item.color} ${item.category}`}
                      className={`max-w-full max-h-full object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-500 ease-out z-10 ${deletingId === item.id ? 'opacity-50 grayscale' : ''}`}
                    />
                  </div>
                  <div className="p-4 flex flex-col gap-2 relative z-20 bg-white dark:bg-zinc-900">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold capitalize text-zinc-900 dark:text-zinc-100">{item.category}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 capitalize font-medium uppercase tracking-wider">{item.formality}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 capitalize">
                      <TagIcon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{item.color} • {item.tags.join(', ')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {view === 'outfits' && (
        <>
          {savedOutfits.length === 0 ? (
            <div className="mt-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950 border border-indigo-100 dark:border-indigo-900 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="h-8 w-8 text-indigo-500 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">No outfits planned yet</h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-md mb-8">
                Let our AI stylist put together the perfect look based on your wardrobe and desired vibe.
              </p>
              <button 
                onClick={() => setIsOutfitModalOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-500 transition-colors shadow-sm"
              >
                <Sparkles className="h-5 w-5" />
                Plan Your First Look
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {savedOutfits.map(outfit => (
                <OutfitCard key={outfit.id} outfit={outfit} clothes={initialClothes} />
              ))}
            </div>
          )}
        </>
      )}

      {view === 'planner' && (
        <>
          {plannerOutfits.length === 0 ? (
            <div className="mt-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950 border border-purple-100 dark:border-purple-900 rounded-full flex items-center justify-center mb-6">
                <Calendar className="h-8 w-8 text-purple-500 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">No weekly plan generated</h3>
              <p className="text-zinc-500 dark:text-zinc-400 max-w-md mb-8">
                Generate a 5-day automated workweek plan. We'll ensure you don't repeat the same base items back-to-back.
              </p>
              <button 
                onClick={handleGenerateWeekly}
                disabled={isGeneratingWeekly}
                className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-500 transition-colors shadow-sm disabled:opacity-50"
              >
                {isGeneratingWeekly ? <Loader2 className="h-5 w-5 animate-spin" /> : <CalendarDays className="h-5 w-5" />}
                {isGeneratingWeekly ? 'Generating Plan...' : 'Generate 5-Day Plan (5 Credits)'}
              </button>
            </div>
          ) : (
            <div className="flex flex-nowrap overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scrollbar-hide flex-1">
              {plannerOutfits.slice(0, 5).map((outfit) => (
                <div key={outfit.id} className="min-w-[85vw] sm:min-w-[400px] snap-center">
                  <OutfitCard outfit={outfit} clothes={initialClothes} />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
      <GenerateOutfitModal 
        isOpen={isOutfitModalOpen} 
        onClose={() => setIsOutfitModalOpen(false)} 
        credits={initialCredits} 
      />
      <TopUpModal 
        isOpen={isTopUpModalOpen}
        onClose={() => setIsTopUpModalOpen(false)}
      />
    </div>
  )
}
