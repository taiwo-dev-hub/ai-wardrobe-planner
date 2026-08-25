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

    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    
    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // 1. Upload to Supabase Storage
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('wardrobe')
      .upload(fileName, imageFile, {
        contentType: imageFile.type,
      })

    if (uploadError) {
      throw new Error(`Storage error: ${uploadError.message}`)
    }

    const { data: { publicUrl } } = supabase
      .storage
      .from('wardrobe')
      .getPublicUrl(fileName)

    // 2. Process with Google GenAI
    const buffer = await imageFile.arrayBuffer()
    const base64Image = Buffer.from(buffer).toString('base64')

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: "Analyze this clothing item and extract its details. Ensure the category is precisely one of: top, bottom, shoes, outerwear, accessory. Formality should be one of: casual, smart-casual, formal." },
            {
              inlineData: {
                mimeType: imageFile.type,
                data: base64Image,
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, enum: ['top', 'bottom', 'shoes', 'outerwear', 'accessory'] },
            color: { type: Type.STRING, description: "Primary color name, e.g. 'navy blue'" },
            formality: { type: Type.STRING, enum: ['casual', 'smart-casual', 'formal'] },
            tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "e.g. ['cotton', 'relaxed fit', 'summer', 'striped']" }
          },
          required: ['category', 'color', 'formality', 'tags']
        } as Schema,
      }
    })

    const aiText = response.text
    if (!aiText) throw new Error("Failed to generate AI content")
    const itemDetails = JSON.parse(aiText)

    // 3. Save to database
    const { data: dbData, error: dbError } = await supabase
      .from('clothes')
      .insert({
        user_id: user.id,
        image_url: publicUrl,
        category: itemDetails.category,
        color: itemDetails.color,
        formality: itemDetails.formality,
        tags: itemDetails.tags,
      })
      .select()
      .single()

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`)
    }

    return NextResponse.json({ item: dbData })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
