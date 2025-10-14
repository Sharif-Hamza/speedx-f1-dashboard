import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    console.log('Fetching privacy policy from Supabase...')
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'NOT SET')
    console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'NOT SET')
    
    const { data, error } = await supabase
      .from('privacy_policy')
      .select('*')
      .order('last_updated', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error('Supabase error fetching privacy policy:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: 'Failed to fetch privacy policy', details: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      console.error('No privacy policy found in database')
      return NextResponse.json(
        { error: 'Privacy policy not found. Please run the SQL setup script.' },
        { status: 404 }
      )
    }

    console.log('Successfully fetched privacy policy')
    return NextResponse.json(data)
  } catch (error) {
    console.error('Unexpected error:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
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
