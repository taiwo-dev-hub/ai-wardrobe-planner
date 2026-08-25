import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Params = Promise<{ id: string }>

export async function DELETE(
  request: Request,
  segmentData: { params: Params }
) {
  try {
    const params = await segmentData.params
    const id = params.id
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing item ID' }, { status: 400 })
    }

    const { data: item } = await supabase
      .from('clothes')
      .select('user_id, image_url')
      .eq('id', id)
      .single()

    if (!item) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 })
    }

    if (item.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const urlParts = item.image_url.split('/')
    const fileName = urlParts.pop()
    const userIdPart = urlParts.pop()
    
    if (fileName && userIdPart === user.id) {
      const storagePath = `${user.id}/${fileName}`
      const { error: storageError } = await supabase
        .storage
        .from('wardrobe')
        .remove([storagePath])

      if (storageError) {
        console.error('Storage deletion error:', storageError)
      }
    }

    const { error: dbError } = await supabase
      .from('clothes')
      .delete()
      .eq('id', id)

    if (dbError) throw dbError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
