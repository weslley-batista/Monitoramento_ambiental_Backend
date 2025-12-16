'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import DashboardLayout from '@/components/DashboardLayout'
import StationsMap from '@/components/StationsMap'
import LatestReadings from '@/components/LatestReadings'
import AlertsPanel from '@/components/AlertsPanel'
import StatsCards from '@/components/StatsCards'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, init } = useAuthStore()

  useEffect(() => {
    init()
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router, init])

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Bem-vindo, {user.name} ({user.role})
          </p>
        </div>

        <StatsCards />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Mapa de Estações</h2>
              <div className="h-96 rounded-lg overflow-hidden">
                <StationsMap />
              </div>
            </div>
          </div>
          <div>
            <AlertsPanel />
          </div>
        </div>

        <LatestReadings />
      </div>
    </DashboardLayout>
  )
}

