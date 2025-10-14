'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export function DeviceMockups() {
  const [iphoneImages, setIphoneImages] = useState<string[]>([])
  const [ipadImages, setIpadImages] = useState<string[]>([])
  const [laptopImages, setLaptopImages] = useState<string[]>([])
  const [currentIphoneIndex, setCurrentIphoneIndex] = useState(0)
  const [currentIpadIndex, setCurrentIpadIndex] = useState(0)
  const [currentLaptopIndex, setCurrentLaptopIndex] = useState(0)

  useEffect(() => {
    // Fetch available images from each folder
    async function loadImages() {
      try {
        // Load iPhone images
        const iphoneRes = await fetch('/api/mockup-images?device=iphone')
        const iphoneData = await iphoneRes.json()
        setIphoneImages(iphoneData.images || [])

        // Load iPad images
        const ipadRes = await fetch('/api/mockup-images?device=ipad')
        const ipadData = await ipadRes.json()
        setIpadImages(ipadData.images || [])

        // Load Laptop images
        const laptopRes = await fetch('/api/mockup-images?device=laptop')
        const laptopData = await laptopRes.json()
        setLaptopImages(laptopData.images || [])
      } catch (error) {
        console.error('Error loading mockup images:', error)
      }
    }

    loadImages()
  }, [])

  // Auto-rotate images every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (iphoneImages.length > 0) {
        setCurrentIphoneIndex((prev) => (prev + 1) % iphoneImages.length)
      }
      if (ipadImages.length > 0) {
        setCurrentIpadIndex((prev) => (prev + 1) % ipadImages.length)
      }
      if (laptopImages.length > 0) {
        setCurrentLaptopIndex((prev) => (prev + 1) % laptopImages.length)
      }
    }, 4000)

    return () => clearInterval(interval)
  }, [iphoneImages.length, ipadImages.length, laptopImages.length])

  return (
    <div className="relative w-full h-full min-h-[600px] flex items-end justify-center gap-8 pb-8">
      {/* Laptop Mock - Left Side */}
      {laptopImages.length > 0 && (
        <div className="relative z-10 flex-shrink-0 mb-8">
          <div className="relative w-[480px] h-[300px]">
            {/* Laptop Frame */}
            <div className="relative w-full h-full">
              {/* Screen */}
              <div className="relative w-full h-[260px] bg-gray-900 rounded-t-xl overflow-hidden border-4 border-gray-800 shadow-2xl">
                {/* Bezel */}
                <div className="absolute inset-0 border-[10px] border-black rounded-t-lg z-10"></div>
                {/* Screen Content */}
                <div className="relative w-full h-full bg-[#0D0D0D] flex items-center justify-center">
                  <div className="relative w-[calc(100%-20px)] h-[calc(100%-20px)]">
                    <Image
                      src={laptopImages[currentLaptopIndex]}
                      alt="SpeedX Dashboard"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>
              </div>
              {/* Keyboard Base */}
              <div className="relative w-full h-[40px] bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-xl shadow-lg">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1.5 bg-gray-600 rounded-b-md"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* iPhone 16 Pro Mock - Right Side */}
      {iphoneImages.length > 0 && (
        <div className="relative z-20 flex-shrink-0">
          <div className="relative w-[240px] h-[490px]">
            {/* iPhone Frame */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-[2.5rem] shadow-2xl border-[3px] border-gray-700">
              {/* Dynamic Island */}
              <div className="absolute top-[16px] left-1/2 -translate-x-1/2 w-[100px] h-[30px] bg-black rounded-full z-20"></div>
              
              {/* Screen */}
              <div className="absolute inset-[10px] bg-black rounded-[2.2rem] overflow-hidden">
                <Image
                  src={iphoneImages[currentIphoneIndex]}
                  alt="SpeedX App"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Side Buttons */}
              <div className="absolute left-[-3px] top-[100px] w-[3px] h-[50px] bg-gray-700 rounded-l"></div>
              <div className="absolute left-[-3px] top-[160px] w-[3px] h-[50px] bg-gray-700 rounded-l"></div>
              <div className="absolute right-[-3px] top-[130px] w-[3px] h-[70px] bg-gray-700 rounded-r"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
