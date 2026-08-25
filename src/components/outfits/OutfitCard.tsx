import { Database } from '@/types/database'

type ClothesRow = Database['public']['Tables']['clothes']['Row']
type OutfitRow = Database['public']['Tables']['outfits']['Row']

interface OutfitCardProps {
  outfit: OutfitRow
  clothes: ClothesRow[]
}

export function OutfitCard({ outfit, clothes }: OutfitCardProps) {
  // Map item_ids to actual clothes objects
  const outfitItems = outfit.item_ids
    .map(id => clothes.find(c => c.id === id))
    .filter((c): c is ClothesRow => c !== undefined)

  // Split styling notes into title and tips since we combined them
  // Assuming format "**Title**\n\nTips"
  let title = "Outfit Plan"
  let tips = outfit.styling_notes
  
  if (outfit.styling_notes.startsWith('**')) {
    const parts = outfit.styling_notes.split('**')
    if (parts.length >= 3) {
      title = parts[1]
      tips = parts.slice(2).join('**').trim()
    }
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
        <div className="flex flex-col gap-3 mb-2">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 leading-tight">{title}</h3>
          </div>
          <span className="w-fit px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap border border-indigo-100 dark:border-indigo-900/50">
            {outfit.style_vibe}
          </span>
        </div>
      </div>
      
      <div className="p-6 bg-zinc-50 dark:bg-zinc-950/30 flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-4 mb-8">
          {outfitItems.map(item => (
            <div key={item.id} className="aspect-square bg-white dark:bg-zinc-900 rounded-2xl p-4 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 shadow-sm relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-100/50 to-transparent dark:from-zinc-900/50 opacity-0 group-hover:opacity-100 transition-opacity" />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={item.image_url} 
                alt={`${item.color} ${item.category}`}
                className="max-w-full max-h-full object-contain drop-shadow-md z-10 group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
        
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 mt-auto shadow-sm">
          <h4 className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3">Styling Tips</h4>
          <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
            {tips}
          </p>
        </div>
      </div>
    </div>
  )
}
