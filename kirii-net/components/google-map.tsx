"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin } from "lucide-react"

// Google Maps API 的類型定義
declare global {
  interface Window {
    google: any
  }
}

interface GoogleMapProps {
  onLocationSelect: (lat: number, lng: number) => void
  selectedLocation: { lat: number; lng: number } | null
}

export function GoogleMap({ onLocationSelect, selectedLocation }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [isMapError, setIsMapError] = useState(false)

  useEffect(() => {
    const loadMap = () => {
      if (typeof window.google === "undefined") {
        setIsMapError(true)
        return
      }

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: selectedLocation || { lat: 0, lng: 0 }, // 默认中心
        zoom: 12,
      })

      setMap(mapInstance)
      setIsMapLoaded(true)

      mapInstance.addListener("click", (mapsMouseEvent: any) => {
        const lat = mapsMouseEvent.latLng.lat()
        const lng = mapsMouseEvent.latLng.lng()
        onLocationSelect(lat, lng)
      })
    }

    if (mapRef.current) {
      loadMap()
    }
  }, [selectedLocation, onLocationSelect])

  // 當選擇的位置變更時更新標記
  useEffect(() => {
    if (map && selectedLocation && window.google) {
      // 移除現有標記
      if (marker) {
        marker.setMap(null)
      }

      // 創建新標記
      const newMarker = new window.google.maps.Marker({
        position: selectedLocation,
        map: map,
        animation: window.google.maps.Animation.DROP,
        title: "選擇的位置",
      })

      setMarker(newMarker)

      // 將地圖中心移至選擇的位置
      map.panTo(selectedLocation)
    }
  }, [map, selectedLocation, marker])

  // 如果 Google Maps 無法加載，顯示模擬地圖
  if (isMapError) {
    return (
      <div className="h-full w-full bg-gray-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">地圖預覽模式</h3>
          <p className="text-gray-500 mb-4">Google Maps API 密鑰未設置或無效。在實際應用中，這裡會顯示互動式地圖。</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium">模擬選擇位置：</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <button
                className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-md text-sm"
                onClick={(e) => {
                  e.preventDefault() // イベントのデフォルト動作を防止
                  onLocationSelect(22.3193, 114.1694)
                }}
              >
                香港中心
              </button>
              <button
                className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-md text-sm"
                onClick={(e) => {
                  e.preventDefault() // イベントのデフォルト動作を防止
                  onLocationSelect(22.3089, 114.2277)
                }}
              >
                觀塘區
              </button>
              <button
                className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-md text-sm"
                onClick={(e) => {
                  e.preventDefault() // イベントのデフォルト動作を防止
                  onLocationSelect(22.2796, 114.1615)
                }}
              >
                尖沙咀
              </button>
              <button
                className="bg-primary/10 hover:bg-primary/20 text-primary p-2 rounded-md text-sm"
                onClick={(e) => {
                  e.preventDefault() // イベントのデフォルト動作を防止
                  onLocationSelect(22.2783, 114.1747)
                }}
              >
                銅鑼灣
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div ref={mapRef} className="h-full w-full rounded-md">
      {/* 地圖加載中顯示 */}
      {!isMapLoaded && (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <p>地圖加載中...</p>
        </div>
      )}
    </div>
  )
}
