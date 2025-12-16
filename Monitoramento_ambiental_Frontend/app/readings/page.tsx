'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { Calendar, Filter, Download, Activity, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ReadingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, init } = useAuthStore()
  const [selectedSensor, setSelectedSensor] = useState<string>('')

  useEffect(() => {
    init()
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router, init])

  const { data: sensors = [] } = useQuery({
    queryKey: ['sensors'],
    queryFn: async () => {
      const response = await api.get('/sensors')
      return response.data
    },
  })

  useEffect(() => {
    if (sensors.length > 0 && !selectedSensor) {
      setSelectedSensor(sensors[0].id)
    }
  }, [sensors, selectedSensor])

  const { data: readings = [], isLoading: isLoadingReadings, error: readingsError } = useQuery({
    queryKey: ['readings', selectedSensor],
    queryFn: async () => {
      if (!selectedSensor) return []
      try {
        const response = await api.get(`/readings/sensor/${selectedSensor}?limit=50`)
        console.log('Readings recebidos:', response.data)
        return response.data || []
      } catch (error: any) {
        console.error('Erro ao buscar readings:', error)
        toast.error(error.response?.data?.message || 'Erro ao carregar leituras')
        return []
      }
    },
    enabled: !!selectedSensor,
    refetchInterval: 10000,
  })

  const chartData = useMemo(() => {
    if (!readings || readings.length === 0) return []
    return readings
      .slice()
      .reverse()
      .map((reading: any) => ({
        time: format(new Date(reading.timestamp), 'HH:mm', { locale: ptBR }),
        fullDate: format(new Date(reading.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
        value: parseFloat(reading.value) || 0,
      }))
  }, [readings])

  const currentSensor = sensors.find((s: any) => s.id === selectedSensor)

  useEffect(() => {
    if (readings.length > 0) {
      console.log('Readings disponíveis:', readings.length)
      console.log('Chart data:', chartData.length)
    }
  }, [readings, chartData])

  if (!isAuthenticated || !user) {
    return null
  }

  const handleExport = () => {
    if (!selectedSensor || readings.length === 0) {
      toast.error('Selecione um sensor e aguarde os dados carregarem')
      return
    }

    const sensorName = currentSensor?.name || 'sensor'
    const sensorType = currentSensor?.type || ''
    const unit = currentSensor?.unit || ''
    
    // Criar CSV
    const headers = ['Data/Hora', 'Valor', 'Unidade', 'Sensor', 'Tipo']
    const rows = readings.map((reading: any) => [
      format(new Date(reading.timestamp), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
      reading.value.toFixed(2),
      unit,
      sensorName,
      sensorType.replace('_', ' '),
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.map((cell: any) => `"${cell}"`).join(',')),
    ].join('\n')

    // Criar blob e fazer download
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `leituras_${sensorName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd', { locale: ptBR })}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.success('Dados exportados com sucesso!')
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Leituras em Tempo Real</h1>
            <p className="text-gray-500 mt-1">Acompanhe a evolução dos dados coletados pelos sensores.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleExport}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 shadow-sm transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 shadow-sm transition-colors">
              <Calendar className="w-4 h-4 mr-2" />
              Hoje
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:w-auto flex-1">
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-1.5 ml-1">
              Selecione o Sensor
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedSensor}
                onChange={(e) => setSelectedSensor(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none appearance-none"
              >
                <option value="">Selecione um sensor</option>
                {sensors.map((sensor: any) => (
                  <option key={sensor.id} value={sensor.id}>
                    {sensor.name} — {sensor.station?.name} ({sensor.type.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {currentSensor && (
            <div className="w-full md:w-auto flex gap-4 border-l border-gray-100 pl-4">
               <div className="px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
                  <span className="text-xs text-blue-600 font-medium block">Unidade</span>
                  <span className="font-bold text-blue-900">{currentSensor.unit}</span>
               </div>
               <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-xs text-gray-500 font-medium block">Range</span>
                  <span className="font-semibold text-gray-700">{currentSensor.minValue ?? 0} - {currentSensor.maxValue ?? 100}</span>
               </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Gráfico de Evolução
              </h2>
              {readings.length > 0 && (
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full animate-pulse">
                  Ao vivo
                </span>
              )}
            </div>
            
            {isLoadingReadings ? (
              <div className="h-[400px] flex items-center justify-center text-gray-400 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                <div className="text-center">
                  <Activity className="w-8 h-8 mx-auto mb-2 animate-pulse text-blue-500" />
                  <p>Carregando dados...</p>
                </div>
              </div>
            ) : readingsError ? (
              <div className="h-[400px] flex items-center justify-center text-red-400 bg-red-50/50 rounded-lg border border-dashed border-red-200">
                <div className="text-center">
                  <p className="font-medium">Erro ao carregar dados</p>
                  <p className="text-sm mt-1">Tente novamente mais tarde</p>
                </div>
              </div>
            ) : selectedSensor && chartData.length > 0 ? (
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ color: '#64748b', marginBottom: '0.5rem', fontSize: '12px' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                      name="Valor Medido"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : selectedSensor && readings.length === 0 ? (
              <div className="h-[400px] flex items-center justify-center text-gray-400 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                <div className="text-center">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Nenhum dado disponível para este sensor</p>
                  <p className="text-sm mt-1 text-gray-500">Aguardando leituras...</p>
                </div>
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-gray-400 bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
                <div className="text-center">
                  <Filter className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Selecione um sensor para visualizar os dados</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[500px] lg:h-auto">
            <div className="p-6 border-b border-gray-100 bg-gray-50/30">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                Últimas Entradas
              </h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-0">
              {readings.length > 0 ? (
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 font-semibold">Valor</th>
                      <th className="px-6 py-3 font-semibold text-right">Hora</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {readings.slice(0, 20).map((reading: any) => (
                      <tr key={reading.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-3.5 font-medium text-gray-900">
                          {reading.value.toFixed(2)} <span className="text-gray-400 text-xs ml-1">{reading.sensor?.unit}</span>
                        </td>
                        <td className="px-6 py-3.5 text-right text-gray-500 tabular-nums">
                          {format(new Date(reading.timestamp), "HH:mm:ss", { locale: ptBR })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Sem dados recentes
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 text-center">
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Ver histórico completo
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
