'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { AlertCircle, CheckCircle2, XCircle, Clock } from 'lucide-react'

interface Alert {
  id: string
  message: string
  value: number
  threshold: number
  status: 'ACTIVE' | 'RESOLVED' | 'DISMISSED'
  createdAt: string
  sensor: {
    name: string
    unit: string
    station: {
      name: string
    }
  }
}

export default function AlertsPanel() {
  const { data: alerts = [], refetch } = useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: async () => {
      const response = await api.get('/alerts?status=ACTIVE')
      return response.data
    },
    refetchInterval: 10000,
  })

  const handleResolve = async (id: string) => {
    try {
      await api.patch(`/alerts/${id}/resolve`)
      toast.success('Alerta marcado como resolvido')
      refetch()
    } catch (error) {
      toast.error('Erro ao resolver alerta')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border h-full flex flex-col">
      <div className="p-6 border-b border-border flex justify-between items-center bg-gray-50/50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <h2 className="text-lg font-semibold text-foreground">Alertas Ativos</h2>
        </div>
        <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200">
          {alerts.length}
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[500px]">
        {alerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8">
            <CheckCircle2 className="w-12 h-12 text-green-500 mb-3 opacity-20" />
            <p>Tudo normal por aqui.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="group bg-red-50/50 hover:bg-red-50 border border-red-100 p-4 rounded-lg transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    {alert.sensor.station.name}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {format(new Date(alert.createdAt), "dd 'de' MMMM 'às' HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                {alert.message}
              </p>
              
              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleResolve(alert.id)}
                  className="flex items-center text-xs font-medium bg-white text-green-700 border border-green-200 px-3 py-1.5 rounded-md hover:bg-green-50 transition-colors shadow-sm"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  Resolver
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
