'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/DashboardLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { 
  Thermometer, 
  Droplets, 
  Wind, 
  Activity, 
  MoreHorizontal, 
  Filter, 
  Plus, 
  Search, 
  Settings2,
  Gauge,
  X
} from 'lucide-react'

export default function SensorsPage() {
  const router = useRouter()
  const { user, isAuthenticated, init } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [filters, setFilters] = useState({
    type: '',
    stationId: '',
    isActive: '',
  })
  const [formData, setFormData] = useState({
    stationId: '',
    name: '',
    type: 'TEMPERATURA',
    unit: '',
    minValue: '',
    maxValue: '',
    alertThreshold: '',
    isActive: true,
  })
  const queryClient = useQueryClient()

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

  const { data: stations = [] } = useQuery({
    queryKey: ['stations'],
    queryFn: async () => {
      const response = await api.get('/stations')
      return response.data
    },
  })

  const createSensorMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload: any = {
        stationId: data.stationId,
        name: data.name,
        type: data.type,
        unit: data.unit,
        isActive: data.isActive,
      }
      if (data.minValue) payload.minValue = parseFloat(data.minValue)
      if (data.maxValue) payload.maxValue = parseFloat(data.maxValue)
      if (data.alertThreshold) payload.alertThreshold = parseFloat(data.alertThreshold)
      
      const response = await api.post('/sensors', payload)
      return response.data
    },
    onSuccess: () => {
      toast.success('Sensor criado com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['sensors'] })
      setShowModal(false)
      setFormData({
        stationId: '',
        name: '',
        type: 'TEMPERATURA',
        unit: '',
        minValue: '',
        maxValue: '',
        alertThreshold: '',
        isActive: true,
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar sensor')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.stationId || !formData.name || !formData.unit) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    createSensorMutation.mutate(formData)
  }

  const sensorTypes = [
    'TEMPERATURA',
    'UMIDADE',
    'QUALIDADE_AR',
    'QUALIDADE_AGUA',
    'PRESENCA_ESPECIE',
    'PH',
    'TURBIDEZ',
    'OXIGENIO_DISSOLVIDO',
  ]

  if (!isAuthenticated || !user) {
    return null
  }

  const getIconForType = (type: string) => {
    switch (type) {
      case 'TEMPERATURA': return <Thermometer className="w-5 h-5" />
      case 'UMIDADE': return <Droplets className="w-5 h-5" />
      case 'QUALIDADE_AR': return <Wind className="w-5 h-5" />
      default: return <Activity className="w-5 h-5" />
    }
  }

  const getColorForType = (type: string) => {
    switch (type) {
      case 'TEMPERATURA': return 'bg-orange-100 text-orange-600'
      case 'UMIDADE': return 'bg-blue-100 text-blue-600'
      case 'QUALIDADE_AR': return 'bg-teal-100 text-teal-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const filteredSensors = sensors.filter((sensor: any) => {
    const matchesSearch = 
      sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sensor.station?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sensor.type.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = !filters.type || sensor.type === filters.type
    const matchesStation = !filters.stationId || sensor.stationId === filters.stationId
    const matchesActive = 
      filters.isActive === '' || 
      (filters.isActive === 'true' && sensor.isActive) ||
      (filters.isActive === 'false' && !sensor.isActive)
    
    return matchesSearch && matchesType && matchesStation && matchesActive
  })

  const clearFilters = () => {
    setFilters({
      type: '',
      stationId: '',
      isActive: '',
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Sensores</h1>
            <p className="text-gray-500 mt-2 text-lg">Monitoramento detalhado de todos os sensores ativos na rede.</p>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={() => setShowFilterModal(true)}
              className="inline-flex items-center px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-700 shadow-sm transition-colors gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtrar
              {(filters.type || filters.stationId || filters.isActive) && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {(filters.type ? 1 : 0) + (filters.stationId ? 1 : 0) + (filters.isActive ? 1 : 0)}
                </span>
              )}
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className="inline-flex items-center px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md hover:shadow-lg font-medium gap-2"
            >
              <Plus className="w-5 h-5" />
              Novo Sensor
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Gauge className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Sensores</p>
              <p className="text-2xl font-bold text-gray-900">{sensors.length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
             <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Ativos</p>
              <p className="text-2xl font-bold text-gray-900">{sensors.filter((s:any) => s.isActive).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/30">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                placeholder="Buscar por nome, tipo ou estação..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all bg-white"
              />
            </div>
            <div className="text-sm text-gray-500">
              Mostrando <span className="font-semibold text-gray-900">{filteredSensors.length}</span> resultados
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider">Sensor</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Tipo</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Estação Vinculada</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Configuração</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSensors.map((sensor: any) => (
                  <tr key={sensor.id} className="bg-white hover:bg-gray-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`p-2.5 rounded-xl mr-4 ${getColorForType(sensor.type)}`}>
                          {getIconForType(sensor.type)}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{sensor.name}</div>
                          <div className="text-xs text-gray-500 font-mono mt-0.5">ID: {sensor.id.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 capitalize">
                        {sensor.type.replace('_', ' ').toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {sensor.station ? (
                        <div className="flex items-center text-gray-700">
                          <span className="font-medium">{sensor.station.name}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Não vinculado</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex items-center text-gray-600 bg-gray-50 px-2 py-1 rounded w-fit">
                          <span className="font-medium mr-1">Unidade:</span> {sensor.unit}
                        </div>
                        <div className="flex items-center text-gray-600 bg-gray-50 px-2 py-1 rounded w-fit">
                          <span className="font-medium mr-1">Range:</span> 
                          {sensor.minValue ?? '-'} a {sensor.maxValue ?? '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          sensor.isActive
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                         <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          sensor.isActive ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        {sensor.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredSensors.length === 0 && (
                   <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-gray-100 p-4 rounded-full mb-3">
                          <Search className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="font-medium">Nenhum sensor encontrado</p>
                      </div>
                    </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Mostrando página 1 de 1
            </span>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1 text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>Next</button>
            </div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Novo Sensor</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estação <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.stationId}
                    onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                    required
                  >
                    <option value="">Selecione uma estação</option>
                    {stations.map((station: any) => (
                      <option key={station.id} value={station.id}>
                        {station.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Sensor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                    placeholder="Ex: Sensor de Temperatura 01"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                      required
                    >
                      {sensorTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unidade <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                      placeholder="Ex: °C, %, ppm"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor Mínimo
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.minValue}
                      onChange={(e) => setFormData({ ...formData, minValue: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                      placeholder="Ex: 0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Valor Máximo
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.maxValue}
                      onChange={(e) => setFormData({ ...formData, maxValue: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                      placeholder="Ex: 100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Limite de Alerta
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.alertThreshold}
                      onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                      placeholder="Ex: 80"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActiveSensor"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="isActiveSensor" className="text-sm font-medium text-gray-700">
                    Sensor ativo
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createSensorMutation.isPending}
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createSensorMutation.isPending ? 'Criando...' : 'Criar Sensor'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showFilterModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Filtros</h2>
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
                    Tipo de Sensor
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                  >
                    <option value="">Todos os tipos</option>
                    {sensorTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estação
                  </label>
                  <select
                    value={filters.stationId}
                    onChange={(e) => setFilters({ ...filters, stationId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
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
                    Status
                  </label>
                  <select
                    value={filters.isActive}
                    onChange={(e) => setFilters({ ...filters, isActive: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                  >
                    <option value="">Todos</option>
                    <option value="true">Ativos</option>
                    <option value="false">Inativos</option>
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
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
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
