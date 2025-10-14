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
    // Directly set image paths - these files exist in public folder
    const iphoneScreenshots = [
      '/mockups/iphone/screen-1.jpg',
      '/mockups/iphone/screen-2.jpg',
      '/mockups/iphone/screen-3.jpg',
      '/mockups/iphone/screen-4.jpg',
      '/mockups/iphone/screen-5.jpg',
      '/mockups/iphone/screen-6.jpg',
    ]
    
    // Check for laptop screenshots (you need to add these)
    const laptopScreenshots = [
      '/mockups/laptop/Screenshot 2025-10-14 at 1.07.57\u202fAM.png',
    ]
    
    setIphoneImages(iphoneScreenshots)
    setLaptopImages(laptopScreenshots)
    // iPad images can be added later
    setIpadImages([])
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
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="flex items-end justify-center gap-4 lg:gap-8">
        {/* Laptop Mock - Only visible on large screens (desktop) */}
        {laptopImages.length > 0 && (
          <div className="hidden lg:block relative z-10 flex-shrink-0">
            <div className="relative w-[380px] xl:w-[480px] h-[240px] xl:h-[300px]">
              {/* Laptop Frame */}
              <div className="relative w-full h-full">
                {/* Screen */}
                <div className="relative w-full h-[210px] xl:h-[260px] bg-gray-900 rounded-t-xl overflow-hidden border-4 border-gray-800 shadow-2xl">
                  {/* Bezel */}
                  <div className="absolute inset-0 border-[8px] xl:border-[10px] border-black rounded-t-lg z-10"></div>
                  {/* Screen Content */}
                  <div className="relative w-full h-full bg-[#0D0D0D] flex items-center justify-center">
                    <div className="relative w-[calc(100%-16px)] xl:w-[calc(100%-20px)] h-[calc(100%-16px)] xl:h-[calc(100%-20px)]">
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
                <div className="relative w-full h-[30px] xl:h-[40px] bg-gradient-to-b from-gray-700 to-gray-800 rounded-b-xl shadow-lg">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 xl:w-20 h-1 xl:h-1.5 bg-gray-600 rounded-b-md"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* iPhone 16 Pro Mock - Always visible, responsive sizing */}
        {iphoneImages.length > 0 && (
          <div className="relative z-20 flex-shrink-0">
            {/* Mobile: Larger iPhone, Tablet: Medium, Desktop: Original */}
            <div className="relative w-[200px] sm:w-[220px] lg:w-[240px] h-[410px] sm:h-[450px] lg:h-[490px]">
              {/* iPhone Frame */}
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-[2rem] sm:rounded-[2.3rem] lg:rounded-[2.5rem] shadow-2xl border-[2px] sm:border-[3px] border-gray-700">
                {/* Dynamic Island */}
                <div className="absolute top-[12px] sm:top-[14px] lg:top-[16px] left-1/2 -translate-x-1/2 w-[85px] sm:w-[95px] lg:w-[100px] h-[25px] sm:h-[28px] lg:h-[30px] bg-black rounded-full z-20"></div>
                
                {/* Screen */}
                <div className="absolute inset-[8px] sm:inset-[9px] lg:inset-[10px] bg-black rounded-[1.8rem] sm:rounded-[2rem] lg:rounded-[2.2rem] overflow-hidden">
                  <Image
                    src={iphoneImages[currentIphoneIndex]}
                    alt="SpeedX App"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                {/* Side Buttons */}
                <div className="absolute left-[-2px] sm:left-[-3px] top-[85px] sm:top-[95px] lg:top-[100px] w-[2px] sm:w-[3px] h-[42px] sm:h-[46px] lg:h-[50px] bg-gray-700 rounded-l"></div>
                <div className="absolute left-[-2px] sm:left-[-3px] top-[135px] sm:top-[150px] lg:top-[160px] w-[2px] sm:w-[3px] h-[42px] sm:h-[46px] lg:h-[50px] bg-gray-700 rounded-l"></div>
                <div className="absolute right-[-2px] sm:right-[-3px] top-[110px] sm:top-[120px] lg:top-[130px] w-[2px] sm:w-[3px] h-[58px] sm:h-[64px] lg:h-[70px] bg-gray-700 rounded-r"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
