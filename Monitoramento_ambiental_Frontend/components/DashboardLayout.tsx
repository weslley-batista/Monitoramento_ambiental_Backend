'use client'

import { useAuthStore } from '@/store/authStore'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Activity, 
  Thermometer, 
  Bell, 
  LogOut, 
  Leaf,
  Menu,
  X,
  ChevronRight,
  User
} from 'lucide-react'
import { useState } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs))
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout } = useAuthStore()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { href: '/stations', label: 'Estações', icon: MapIcon },
    { href: '/sensors', label: 'Sensores', icon: Thermometer },
    { href: '/readings', label: 'Leituras', icon: Activity },
    { href: '/alerts', label: 'Alertas', icon: Bell },
  ]

  return (
    <div className="min-h-screen bg-gray-50/50 flex font-sans text-gray-900">
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:transform-none shadow-xl lg:shadow-none flex flex-col",
          isMobileMenuOpen ? "translate-x-0"           : "-translate-x-full"
        )}
      >
        <div className="h-20 flex items-center px-8 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-xl text-green-600">
              <Leaf className="w-6 h-6 fill-current" />
            </div>
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-emerald-600">
                EcoMonitor
              </span>
              <p className="text-xs text-gray-500 font-medium">Sistema Ambiental</p>
            </div>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="ml-auto lg:hidden text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Menu Principal
          </p>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.href === '/dashboard' 
              ? pathname === '/dashboard'
              : pathname.startsWith(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 border border-transparent",
                  isActive 
                    ? "bg-green-50 text-green-700 border-green-100 shadow-sm" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className={cn(
                  "w-5 h-5 mr-3 transition-colors duration-200", 
                  isActive ? "text-green-600" : "text-gray-400 group-hover:text-gray-600"
                )} />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 text-green-600 opacity-50" />}
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-green-600 shadow-sm ring-2 ring-white">
              {user?.name ? (
                 <span className="font-bold text-lg">{user.name.charAt(0).toUpperCase()}</span>
              ) : (
                <User className="w-5 h-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{user?.name || 'Usuário'}</p>
              <p className="text-xs text-gray-500 truncate capitalize">{user?.role?.toLowerCase() || 'Visitante'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2.5 text-sm font-medium text-red-600 bg-white hover:bg-red-50 border border-red-100 hover:border-red-200 rounded-lg transition-all duration-200 shadow-sm group"
          >
            <LogOut className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            Sair da conta
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-50/50">
        <header className="h-16 lg:hidden bg-white border-b border-gray-200 flex items-center justify-between px-4 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-green-600" />
              <span className="font-bold text-gray-900">EcoMonitor</span>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-sm font-bold border border-green-200">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
