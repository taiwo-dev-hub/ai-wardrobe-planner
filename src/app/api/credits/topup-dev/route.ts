import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('credits_balance')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const newBalance = profile.credits_balance + 20

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ credits_balance: newBalance })
      .eq('id', user.id)

    if (updateError) throw updateError

    return NextResponse.json({ success: true, balance: newBalance })
  } catch (error: any) {
    console.error('Top-up error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
