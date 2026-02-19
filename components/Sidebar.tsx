'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Profile } from '@/types'
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Building2,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Bell
} from 'lucide-react'
import toast from 'react-hot-toast'

interface SidebarProps {
  profile: Profile | null
}

export default function Sidebar({ profile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    window.location.href = '/login'
  }

  const navItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/dashboard/tasks', icon: CheckSquare, label: 'All Tasks' },
  ]

  const adminItems = [
    { href: '/dashboard/team', icon: Users, label: 'Team' },
  ]

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : profile?.email?.[0]?.toUpperCase() || 'U'

  return (
    <aside
      className={`flex flex-col bg-white border-r border-slate-100 transition-all duration-300 relative flex-shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
      style={{ boxShadow: '2px 0 16px rgba(12,132,234,0.04)' }}
    >
      {/* Header */}
      <div className={`flex items-center gap-3 p-6 border-b border-slate-100 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 bg-azure-500 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ boxShadow: '0 4px 12px rgba(12,132,234,0.3)' }}>
          <Building2 size={18} className="text-white" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-display font-bold text-azure-800 text-lg leading-none">TaskFlow</h1>
            <p className="text-xs text-slate-400 mt-0.5">Financial Management</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          )
        })}

        {profile?.role === 'admin' && (
          <>
            {!collapsed && (
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 pt-4 pb-1">
                Admin
              </p>
            )}
            {collapsed && <div className="border-t border-slate-100 my-2" />}
            {adminItems.map(({ href, icon: Icon, label }) => {
              const isActive = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}
                  title={collapsed ? label : undefined}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {!collapsed && <span>{label}</span>}
                </Link>
              )
            })}
          </>
        )}
      </nav>

      {/* User profile */}
      <div className={`p-3 border-t border-slate-100`}>
        <div className={`flex items-center gap-3 p-3 rounded-xl bg-slate-50 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-9 h-9 bg-azure-100 rounded-full flex items-center justify-center flex-shrink-0 relative">
            <span className="text-azure-700 font-semibold text-sm">{initials}</span>
            {profile?.role === 'admin' && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-azure-500 rounded-full flex items-center justify-center">
                <Shield size={8} className="text-white" />
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 truncate">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs text-slate-400 truncate capitalize">{profile?.role}</p>
            </div>
          )}
          {!collapsed && (
            <button
              onClick={handleSignOut}
              className="text-slate-400 hover:text-red-500 transition-colors p-1"
              title="Sign out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={handleSignOut}
            className="w-full flex justify-center text-slate-400 hover:text-red-500 transition-colors p-2 mt-1"
            title="Sign out"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3.5 top-8 w-7 h-7 bg-white rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:text-azure-600 hover:border-azure-300 transition-all shadow-sm"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </aside>
  )
}
