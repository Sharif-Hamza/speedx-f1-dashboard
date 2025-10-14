import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('privacy_policy')
      .select('*')
      .order('last_updated', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Error fetching privacy policy:', error)
      return NextResponse.json(
        { error: 'Failed to fetch privacy policy' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const { content, userId } = await request.json()

    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    // Update privacy policy
    const { data, error } = await supabase
      .from('privacy_policy')
      .update({
        content,
        last_updated: new Date().toISOString(),
        updated_by: userId
      })
      .eq('id', (await supabase.from('privacy_policy').select('id').order('last_updated', { ascending: false }).limit(1).single()).data?.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating privacy policy:', error)
      return NextResponse.json(
        { error: 'Failed to update privacy policy' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
