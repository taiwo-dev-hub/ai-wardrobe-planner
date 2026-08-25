import { createClient } from '@/lib/supabase/server'
import { DashboardView } from '@/components/wardrobe/DashboardView'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: clothes } = await supabase
    .from('clothes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: outfits } = await supabase
    .from('outfits')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  let { data: profile } = await supabase
    .from('profiles')
    .select('credits_balance')
    .eq('id', user.id)
    .single()
    
  const credits = profile?.credits_balance ?? 10

  return <DashboardView initialClothes={clothes || []} initialOutfits={outfits || []} initialCredits={credits} />
}
