'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/DashboardLayout'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Filter, 
  Search,
  AlertTriangle,
  ArrowRight,
  MoreVertical,
  X
} from 'lucide-react'

export default function AlertsPage() {
  const router = useRouter()
  const { user, isAuthenticated, init } = useAuthStore()
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: 'all',
    stationId: '',
    sensorId: '',
  })

  useEffect(() => {
    init()
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router, init])

  const { data: alerts = [], refetch } = useQuery({
    queryKey: ['alerts', 'all'],
    queryFn: async () => {
      const response = await api.get('/alerts')
      return response.data
    },
    refetchInterval: 10000,
  })

  const { data: stations = [] } = useQuery({
    queryKey: ['stations'],
    queryFn: async () => {
      const response = await api.get('/stations')
      return response.data
    },
  })

  const { data: sensors = [] } = useQuery({
    queryKey: ['sensors'],
    queryFn: async () => {
      const response = await api.get('/sensors')
      return response.data
    },
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

  const handleDismiss = async (id: string) => {
    try {
      await api.patch(`/alerts/${id}/dismiss`)
      toast.success('Alerta descartado')
      refetch()
    } catch (error) {
      toast.error('Erro ao descartar alerta')
    }
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const activeAlerts = alerts.filter((a: any) => a.status === 'ACTIVE')
  const resolvedAlerts = alerts.filter((a: any) => a.status === 'RESOLVED')
  const dismissedAlerts = alerts.filter((a: any) => a.status === 'DISMISSED')

  const filteredAlerts = alerts.filter((a: any) => {

    const matchesStatus = filterStatus === 'all' || a.status === filterStatus
    
    const matchesAdvancedStatus = filters.status === 'all' || a.status === filters.status
    const matchesStation = !filters.stationId || a.sensor?.stationId === filters.stationId
    const matchesSensor = !filters.sensorId || a.sensorId === filters.sensorId
    
    const matchesSearch = 
      !searchTerm ||
      a.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.sensor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.sensor?.station?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesAdvancedStatus && matchesStation && matchesSensor && matchesSearch
  })

  const clearFilters = () => {
    setFilters({
      status: 'all',
      stationId: '',
      sensorId: '',
    })
    setSearchTerm('')
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Central de Alertas</h1>
            <p className="text-gray-500 mt-2 text-lg">Gerencie incidentes e notificações do sistema em tempo real.</p>
          </div>
          <div className="flex gap-3">
             <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                placeholder="Buscar alertas..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-sm"
              />
             </div>
             <button 
              onClick={() => setShowFilterModal(true)}
              className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-700 shadow-sm transition-colors gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtrar
              {(filters.status !== 'all' || filters.stationId || filters.sensorId) && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {(filters.status !== 'all' ? 1 : 0) + (filters.stationId ? 1 : 0) + (filters.sensorId ? 1 : 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border-l-4 border-l-red-500 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <AlertCircle className="w-24 h-24 text-red-600 transform translate-x-4 -translate-y-4" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-red-50 rounded-lg text-red-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-1 rounded-full">Críticos</span>
              </div>
              <h3 className="text-sm font-medium text-gray-500">Alertas Ativos</h3>
              <p className="text-4xl font-bold text-gray-900 mt-2 tracking-tight">{activeAlerts.length}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border-l-4 border-l-green-500 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <CheckCircle2 className="w-24 h-24 text-green-600 transform translate-x-4 -translate-y-4" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-1 rounded-full">Resolvidos</span>
              </div>
              <h3 className="text-sm font-medium text-gray-500">Total Resolvidos</h3>
              <p className="text-4xl font-bold text-gray-900 mt-2 tracking-tight">{resolvedAlerts.length}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border-l-4 border-l-gray-400 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
             <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <XCircle className="w-24 h-24 text-gray-600 transform translate-x-4 -translate-y-4" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                  <XCircle className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-600 bg-gray-100 px-2 py-1 rounded-full">Arquivo</span>
              </div>
              <h3 className="text-sm font-medium text-gray-500">Descartados</h3>
              <p className="text-4xl font-bold text-gray-900 mt-2 tracking-tight">{dismissedAlerts.length}</p>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {['all', 'ACTIVE', 'RESOLVED', 'DISMISSED'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`
                  whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${filterStatus === status
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                {status === 'all' ? 'Todos os Alertas' : 
                 status === 'ACTIVE' ? 'Ativos' : 
                 status === 'RESOLVED' ? 'Resolvidos' : 'Descartados'}
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider">Origem do Alerta</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Detalhes</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Parâmetros</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Ocorrido em</th>
                  <th className="px-6 py-4 text-right tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAlerts.map((alert: any) => (
                  <tr key={alert.id} className="bg-white hover:bg-red-50/10 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900">{alert.sensor?.station?.name || 'Estação Desconhecida'}</span>
                        <span className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" /> {alert.sensor?.name || 'Sensor'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900 font-medium max-w-xs truncate" title={alert.message}>
                        {alert.message}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center justify-between bg-red-50 text-red-700 px-2 py-1 rounded max-w-[120px]">
                          <span>Valor:</span>
                          <span className="font-bold">{alert.value.toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between bg-gray-50 text-gray-600 px-2 py-1 rounded max-w-[120px]">
                          <span>Limite:</span>
                          <span className="font-medium">{alert.threshold.toFixed(2)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          alert.status === 'ACTIVE'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : alert.status === 'RESOLVED'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                         {alert.status === 'ACTIVE' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5 animate-pulse" />}
                        {alert.status === 'ACTIVE'
                          ? 'Crítico'
                          : alert.status === 'RESOLVED'
                          ? 'Resolvido'
                          : 'Descartado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="tabular-nums">
                          {format(new Date(alert.createdAt), "dd/MM HH:mm", { locale: ptBR })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {alert.status === 'ACTIVE' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleResolve(alert.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg border border-transparent hover:border-green-200 transition-all shadow-sm"
                            title="Marcar como Resolvido"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDismiss(alert.id)}
                            className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-all shadow-sm"
                            title="Descartar"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button className="text-gray-400 p-2 hover:bg-gray-50 rounded-lg">
                           <MoreVertical className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                 {filteredAlerts.length === 0 && (
                   <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-50 p-4 rounded-full mb-3">
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        </div>
                        <p className="font-medium">Nenhum alerta encontrado</p>
                        <p className="text-xs mt-1">Tudo parece estar normal por aqui.</p>
                      </div>
                    </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showFilterModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Filtros de Alertas</h2>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  >
                    <option value="all">Todos os status</option>
                    <option value="ACTIVE">Ativos</option>
                    <option value="RESOLVED">Resolvidos</option>
                    <option value="DISMISSED">Descartados</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estação
                  </label>
                  <select
                    value={filters.stationId}
                    onChange={(e) => setFilters({ ...filters, stationId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  >
                    <option value="">Todas as estações</option>
                    {stations.map((station: any) => (
                      <option key={station.id} value={station.id}>
                        {station.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sensor
                  </label>
                  <select
                    value={filters.sensorId}
                    onChange={(e) => setFilters({ ...filters, sensorId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  >
                    <option value="">Todos os sensores</option>
                    {sensors
                      .filter((sensor: any) => !filters.stationId || sensor.stationId === filters.stationId)
                      .map((sensor: any) => (
                        <option key={sensor.id} value={sensor.id}>
                          {sensor.name} - {sensor.station?.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Limpar
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowFilterModal(false)}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
