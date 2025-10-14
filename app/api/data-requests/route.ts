import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { name, email, requestType, message } = await request.json()

    // Validation
    if (!email || !requestType) {
      return NextResponse.json(
        { error: 'Email and request type are required' },
        { status: 400 }
      )
    }

    if (!['export', 'delete'].includes(requestType)) {
      return NextResponse.json(
        { error: 'Invalid request type' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Insert data request
    const { data, error } = await supabase
      .from('data_requests')
      .insert({
        name,
        email,
        request_type: requestType,
        message,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating data request:', error)
      return NextResponse.json(
        { error: 'Failed to submit data request' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Data request submitted successfully',
      data
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('data_requests')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching data requests:', error)
      return NextResponse.json(
        { error: 'Failed to fetch data requests' },
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
