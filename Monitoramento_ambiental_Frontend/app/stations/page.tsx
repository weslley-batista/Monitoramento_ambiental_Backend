'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/DashboardLayout'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'
import { 
  MapPin, 
  Signal, 
  Activity, 
  Info, 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  Thermometer,
  X
} from 'lucide-react'

export default function StationsPage() {
  const router = useRouter()
  const { user, isAuthenticated, init } = useAuthStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    latitude: '',
    longitude: '',
    isActive: true,
  })
  const queryClient = useQueryClient()

  useEffect(() => {
    init()
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router, init])

  const { data: stations = [] } = useQuery({
    queryKey: ['stations'],
    queryFn: async () => {
      const response = await api.get('/stations')
      return response.data
    },
  })

  const createStationMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/stations', {
        ...data,
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
      })
      return response.data
    },
    onSuccess: () => {
      toast.success('Estação criada com sucesso!')
      queryClient.invalidateQueries({ queryKey: ['stations'] })
      setShowModal(false)
      setFormData({
        name: '',
        description: '',
        latitude: '',
        longitude: '',
        isActive: true,
      })
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar estação')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.latitude || !formData.longitude) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    createStationMutation.mutate(formData)
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const activeStations = stations.filter((s: any) => s.isActive).length
  const totalStations = stations.length
  const offlineStations = totalStations - activeStations
  
  const filteredStations = stations.filter((station: any) => 
    station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Estações de Monitoramento</h1>
            <p className="text-gray-500 mt-2 text-lg">Gerencie e visualize o status de todas as estações cadastradas na rede.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center px-5 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md hover:shadow-lg font-medium gap-2"
          >
            <Plus className="w-5 h-5" />
            Nova Estação
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total de Estações</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{totalStations}</p>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <MapPin className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Estações Online</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{activeStations}</p>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <Signal className="w-6 h-6" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Estações Offline</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{offlineStations}</p>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Buscar estações por nome..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all shadow-sm"
            />
          </div>
          <button className="inline-flex items-center px-5 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 text-gray-700 shadow-sm transition-colors gap-2">
            <Filter className="w-4 h-4" />
            Filtros
          </button>
        </div>

        {filteredStations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStations.map((station: any) => (
              <div
                key={station.id}
                className="group bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-green-200 transition-all duration-300 flex flex-col overflow-hidden"
              >
                <div className="p-6 pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gray-100 rounded-xl group-hover:bg-green-50 group-hover:text-green-600 transition-colors">
                        <MapPin className="w-6 h-6 text-gray-500 group-hover:text-green-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-green-700 transition-colors">{station.name}</h3>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          ID: <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600">{station.id.substring(0, 8)}</span>
                        </p>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-2 min-h-[40px] leading-relaxed">
                    {station.description || 'Sem descrição disponível para esta estação.'}
                  </p>
                </div>

                <div className="px-6 py-4 bg-gray-50/50 border-t border-b border-gray-100 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-700">{station.sensors?.length || 0} <span className="text-gray-500 font-normal">Sensores</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-gray-700">{station._count?.readings || 0} <span className="text-gray-500 font-normal">Leituras</span></span>
                  </div>
                </div>
                
                <div className="p-4 mt-auto flex items-center justify-between">
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                    station.isActive
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${
                      station.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                    }`} />
                    {station.isActive ? 'Operando' : 'Fora do Ar'}
                  </div>

                  <button className="text-sm text-gray-600 font-medium hover:text-green-700 flex items-center gap-1.5 transition-colors group/btn">
                    Ver Detalhes 
                    <Info className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Nenhuma estação encontrada</h3>
            <p className="text-gray-500 max-w-sm mx-auto mt-2">
              Não encontramos nenhuma estação com os filtros aplicados. Tente buscar com outros termos.
            </p>
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-6 text-green-600 font-medium hover:underline"
            >
              Limpar filtros
            </button>
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Nova Estação</h2>
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
                    Nome da Estação <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                    placeholder="Ex: Estação Central"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all resize-none"
                    rows={3}
                    placeholder="Descrição da estação..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                      placeholder="Ex: -23.5505"
                      min="-90"
                      max="90"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                      placeholder="Ex: -46.6333"
                      min="-180"
                      max="180"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                    Estação ativa
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
                    disabled={createStationMutation.isPending}
                    className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createStationMutation.isPending ? 'Criando...' : 'Criar Estação'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
