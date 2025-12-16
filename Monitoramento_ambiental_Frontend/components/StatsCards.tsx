'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Radio, ThermometerSun, AlertTriangle } from 'lucide-react'

export default function StatsCards() {
  const { data: stations = [] } = useQuery({
    queryKey: ['stations'],
    queryFn: async () => {
      const response = await api.get('/stations')
      return response.data
    },
  })

  const { data: alertsCount = 0 } = useQuery({
    queryKey: ['alerts', 'count'],
    queryFn: async () => {
      const response = await api.get('/alerts/count')
      return response.data.count || 0
    },
    refetchInterval: 10000,
  })

  const totalSensors = stations.reduce(
    (acc: number, station: any) => acc + (station.sensors?.length || 0),
    0
  )

  const activeStations = stations.filter((s: any) => s.isActive).length

  const stats = [
    {
      name: 'Estações Ativas',
      value: activeStations,
      total: stations.length,
      icon: Radio,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      name: 'Total de Sensores',
      value: totalSensors,
      icon: ThermometerSun,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      name: 'Alertas Ativos',
      value: alertsCount,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.name}
            className={`bg-white rounded-xl shadow-sm border p-6 flex items-start justify-between transition-all hover:shadow-md ${stat.border}`}
          >
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
              <div className="flex items-baseline mt-2">
                <span className="text-3xl font-bold text-foreground tracking-tight">
                  {stat.value}
                </span>
                {stat.total !== undefined && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    / {stat.total}
                  </span>
                )}
              </div>
            </div>
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
