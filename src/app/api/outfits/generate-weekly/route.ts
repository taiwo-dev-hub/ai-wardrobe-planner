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

    // Check credits (Costs 5 credits)
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits_balance')
      .eq('id', user.id)
      .single()

    if (!profile || profile.credits_balance < 5) {
      return NextResponse.json({ error: 'Out of credits. Generating a 5-day plan costs 5 credits.' }, { status: 403 })
    }

    // Fetch wardrobe
    const { data: clothes } = await supabase
      .from('clothes')
      .select('id, category, color, formality, tags')
      .eq('user_id', user.id)

    if (!clothes || clothes.length < 5) {
      return NextResponse.json({ error: 'You need a larger wardrobe (at least 5 items) to generate a full weekly plan.' }, { status: 400 })
    }

    const aiPrompt = `
      You are an expert fashion stylist. Create a 5-Day Workweek (Monday to Friday) wardrobe plan from the user's provided wardrobe items.
      
      Wardrobe Items (JSON):
      ${JSON.stringify(clothes)}

      Rules:
      - Create exactly 5 distinct outfits (one for each day: Monday, Tuesday, Wednesday, Thursday, Friday).
      - Each outfit must select exactly 1 top, 1 bottom, 1 pair of shoes. Optionally outerwear/accessories.
      - DO NOT use the exact same base items on back-to-back days to ensure rotation.
      - Extract the UUIDs of the selected items exactly as provided.
      - Provide a creative 'outfit_title' that MUST start with the Day of the week (e.g., "Monday: Corporate Chic", "Tuesday: Relaxed Office").
      - Provide detailed 'styling_tips'.
    `

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: aiPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              outfit_title: { type: Type.STRING, description: "Must start with the Day, e.g., 'Monday: Smart Casual'" },
              item_ids: { type: Type.ARRAY, items: { type: Type.STRING } },
              styling_tips: { type: Type.STRING },
            },
            required: ['outfit_title', 'item_ids', 'styling_tips']
          },
          description: "An array of 5 outfit objects"
        } as Schema,
      }
    })

    const aiText = response.text
    if (!aiText) throw new Error("Failed to generate AI content")
    const outfitsResult = JSON.parse(aiText)

    if (!Array.isArray(outfitsResult) || outfitsResult.length !== 5) {
       throw new Error("AI did not generate exactly 5 outfits.")
    }

    // Deduct 5 credits
    const { error: creditError } = await supabase
      .from('profiles')
      .update({ credits_balance: profile.credits_balance - 5 })
      .eq('id', user.id)

    if (creditError) throw new Error("Failed to deduct credits")

    // Prepare inserts
    const outfitsToInsert = outfitsResult.map((outfit: any) => ({
      user_id: user.id,
      style_vibe: 'Workweek Plan',
      styling_notes: `**${outfit.outfit_title}**\n\n${outfit.styling_tips}`,
      item_ids: outfit.item_ids,
    }))

    // Insert all 5 outfits
    const { data: insertedOutfits, error: outfitError } = await supabase
      .from('outfits')
      .insert(outfitsToInsert)
      .select()

    if (outfitError) throw new Error(`Failed to save outfits: ${outfitError.message}`)

    return NextResponse.json({ outfits: insertedOutfits })
  } catch (error: any) {
    console.error('Weekly generation error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
