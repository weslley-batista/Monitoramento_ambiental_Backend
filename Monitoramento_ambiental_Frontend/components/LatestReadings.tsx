'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Activity, ArrowUpRight } from 'lucide-react'

interface Reading {
  id: string
  value: number
  timestamp: string
  sensor: {
    id: string
    name: string
    unit: string
    type: string
  }
  station: {
    id: string
    name: string
  }
}

export default function LatestReadings() {
  const { data: readings = [] } = useQuery<Reading[]>({
    queryKey: ['readings', 'latest'],
    queryFn: async () => {
      const response = await api.get('/readings/latest')
      return response.data
    },
    refetchInterval: 5000,
  })

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
      <div className="p-6 border-b border-border flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Monitoramento em Tempo Real</h2>
        </div>
        <button className="text-sm text-primary hover:text-primary-700 font-medium flex items-center transition-colors">
          Ver histórico <ArrowUpRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-secondary/50 border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold">Estação</th>
              <th className="px-6 py-4 font-semibold">Sensor</th>
              <th className="px-6 py-4 font-semibold">Valor Atual</th>
              <th className="px-6 py-4 font-semibold">Última Leitura</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {readings.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                  Aguardando dados dos sensores...
                </td>
              </tr>
            ) : (
              readings.map((reading) => (
                <tr key={reading.id} className="bg-white hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 font-medium text-foreground">
                    {reading.station.name}
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                      {reading.sensor.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-baseline">
                      <span className="text-base font-bold text-foreground mr-1">
                        {reading.value.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground font-medium">
                        {reading.sensor.unit}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground tabular-nums">
                    {format(new Date(reading.timestamp), "dd/MM/yyyy HH:mm:ss", {
                      locale: ptBR,
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
