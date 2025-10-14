import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    console.log('=== Support Request API Called ===')
    const body = await request.json()
    console.log('Request body:', body)
    
    const { name, email, topic, message } = body

    // Validation
    if (!name || !email || !topic || !message) {
      console.error('Validation failed: Missing fields', { name: !!name, email: !!email, topic: !!topic, message: !!message })
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (message.length < 20) {
      console.error('Validation failed: Message too short', { length: message.length })
      return NextResponse.json(
        { error: 'Message must be at least 20 characters' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.error('Validation failed: Invalid email', { email })
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    console.log('Validation passed, inserting into database...')
    
    // Insert support request
    const { data, error } = await supabase
      .from('support_requests')
      .insert({
        name,
        email,
        topic,
        message,
        status: 'new'
      })
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('Successfully created support request:', data)
    return NextResponse.json({
      success: true,
      message: 'Support request submitted successfully',
      data
    })
  } catch (error) {
    console.error('Unexpected error in support-requests API:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('support_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching support requests:', error)
      return NextResponse.json(
        { error: 'Failed to fetch support requests' },
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
