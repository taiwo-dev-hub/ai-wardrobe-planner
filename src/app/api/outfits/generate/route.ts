import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenAI, Type, Schema } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

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

    if (!profile || profile.credits_balance <= 0) {
      return NextResponse.json({ error: 'Out of credits. Please upgrade your plan or purchase more credits.' }, { status: 403 })
    }

    const body = await request.json()
    const { vibe, prompt } = body

    const { data: clothes } = await supabase
      .from('clothes')
      .select('id, category, color, formality, tags')
      .eq('user_id', user.id)

    if (!clothes || clothes.length === 0) {
      return NextResponse.json({ error: 'Wardrobe is empty.' }, { status: 400 })
    }

    const hasTop = clothes.some(c => c.category === 'top')
    const hasBottom = clothes.some(c => c.category === 'bottom')
    const hasShoes = clothes.some(c => c.category === 'shoes')

    if (!hasTop || !hasBottom || !hasShoes) {
      return NextResponse.json({ error: 'You need at least 1 top, 1 bottom, and 1 pair of shoes in your wardrobe to generate an outfit.' }, { status: 400 })
    }

    const aiPrompt = `
      You are an expert fashion stylist. Create an outfit from the user's provided wardrobe items.
      Requested Vibe: ${vibe}
      Custom Prompt: ${prompt || 'None'}
      
      Wardrobe Items (JSON):
      ${JSON.stringify(clothes)}

      Rules:
      - Select exactly 1 top, 1 bottom, 1 pair of shoes.
      - Optionally select outerwear and/or accessories if they fit the vibe.
      - Ensure the combination makes sense fashionably.
      - Extract the UUIDs of the selected items exactly as provided.
      - Create a creative 'outfit_title'.
      - Provide detailed 'styling_tips'.
    `

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: aiPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            outfit_title: { type: Type.STRING },
            item_ids: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of UUIDs selected strictly from the provided wardrobe items." },
            styling_tips: { type: Type.STRING, description: "Detailed wearing advice." },
          },
          required: ['outfit_title', 'item_ids', 'styling_tips']
        } as Schema,
      }
    })

    const aiText = response.text
    if (!aiText) throw new Error("Failed to generate AI content")
    const result = JSON.parse(aiText)

    const combinedNotes = `**${result.outfit_title}**\n\n${result.styling_tips}`

    const { error: creditError } = await supabase
      .from('profiles')
      .update({ credits_balance: profile.credits_balance - 1 })
      .eq('id', user.id)

    if (creditError) throw new Error("Failed to deduct credit")

    const { data: outfit, error: outfitError } = await supabase
      .from('outfits')
      .insert({
        user_id: user.id,
        style_vibe: vibe,
        styling_notes: combinedNotes,
        item_ids: result.item_ids,
      })
      .select()
      .single()

    if (outfitError) throw new Error(`Failed to save outfit: ${outfitError.message}`)

    return NextResponse.json({ outfit })
  } catch (error: any) {
    console.error('Outfit generation error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
