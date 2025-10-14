import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const device = searchParams.get('device') || 'iphone'
    
    // Validate device type
    const validDevices = ['iphone', 'ipad', 'laptop']
    if (!validDevices.includes(device)) {
      return NextResponse.json({ error: 'Invalid device type' }, { status: 400 })
    }

    // Get the public directory path
    const publicDir = path.join(process.cwd(), 'public', 'mockups', device)
    
    // Check if directory exists
    if (!fs.existsSync(publicDir)) {
      return NextResponse.json({ images: [] })
    }

    // Read all files from the directory
    const files = fs.readdirSync(publicDir)
    
    // Filter for image files and sort them
    const imageFiles = files
      .filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file))
      .sort()
      .map(file => `/mockups/${device}/${file}`)

    return NextResponse.json({ images: imageFiles })
  } catch (error) {
    console.error('Error reading mockup images:', error)
    return NextResponse.json({ error: 'Failed to load images' }, { status: 500 })
  }
}
