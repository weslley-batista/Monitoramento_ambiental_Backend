'use client'

import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface Station {
  id: string
  name: string
  description?: string
  latitude: number
  longitude: number
  isActive: boolean
  sensors?: any[]
}

export default function StationsMap() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { data: stations = [] } = useQuery<Station[]>({
    queryKey: ['stations'],
    queryFn: async () => {
      const response = await api.get('/stations')
      return response.data
    },
  })

  if (!mounted) {
    return <div className="h-full w-full bg-gray-200 animate-pulse" />
  }

  const center: [number, number] = stations.length > 0
    ? [stations[0].latitude, stations[0].longitude]
    : [-23.5505, -46.6333]

  return (
    <MapContainer
      center={center}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {stations.map((station) => (
        <Marker
          key={station.id}
          position={[station.latitude, station.longitude]}
        >
          <Popup>
            <div>
              <h3 className="font-semibold">{station.name}</h3>
              {station.description && (
                <p className="text-sm text-gray-600">{station.description}</p>
              )}
              <p className="text-xs mt-2">
                Status: {station.isActive ? 'Ativa' : 'Inativa'}
              </p>
              {station.sensors && (
                <p className="text-xs">
                  Sensores: {station.sensors.length}
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

