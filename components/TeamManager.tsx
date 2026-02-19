'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Profile, UserRole } from '@/types'
import {
  Users, Shield, UserCheck, UserX, Search, Mail,
  Crown, ChevronDown, AlertTriangle, CheckCircle2
} from 'lucide-react'
import toast from 'react-hot-toast'

interface TeamManagerProps {
  profiles: Profile[]
  currentUser: Profile
}

export default function TeamManager({ profiles: initialProfiles, currentUser }: TeamManagerProps) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState<string | null>(null)
  const supabase = createClient()

  const filtered = profiles.filter(p =>
    p.email?.toLowerCase().includes(search.toLowerCase()) ||
    p.full_name?.toLowerCase().includes(search.toLowerCase())
  )

  const admins = filtered.filter(p => p.role === 'admin')
  const staff = filtered.filter(p => p.role === 'staff')

  const updateRole = async (profileId: string, newRole: UserRole) => {
    if (profileId === currentUser.id && newRole === 'staff') {
      toast.error("You can't demote yourself!")
      return
    }
    setLoading(profileId)
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', profileId)

    if (error) {
      toast.error('Failed to update role')
    } else {
      setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, role: newRole } : p))
      toast.success(`Role updated to ${newRole}`)
    }
    setLoading(null)
  }

  const stats = {
    total: profiles.length,
    admins: profiles.filter(p => p.role === 'admin').length,
    staff: profiles.filter(p => p.role === 'staff').length,
  }

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between flex-shrink-0"
        style={{ boxShadow: '0 1px 8px rgba(12,132,234,0.04)' }}>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">Team Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">Manage user roles and access levels</p>
        </div>
        <div className="flex items-center gap-2 bg-azure-50 border border-azure-200 rounded-xl px-4 py-2">
          <Shield size={16} className="text-azure-500" />
          <span className="text-azure-700 text-sm font-semibold">Admin Panel</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="w-10 h-10 bg-azure-50 rounded-xl flex items-center justify-center mb-3">
              <Users size={20} className="text-azure-500" />
            </div>
            <div className="font-display text-3xl font-bold text-slate-800">{stats.total}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Total Members</div>
          </div>
          <div className="stat-card">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
              <Crown size={20} className="text-purple-500" />
            </div>
            <div className="font-display text-3xl font-bold text-slate-800">{stats.admins}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Admins</div>
          </div>
          <div className="stat-card">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-3">
              <UserCheck size={20} className="text-emerald-500" />
            </div>
            <div className="font-display text-3xl font-bold text-slate-800">{stats.staff}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Staff Members</div>
          </div>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-3 bg-azure-50 border border-azure-200 rounded-2xl p-4">
          <AlertTriangle size={18} className="text-azure-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-azure-800 text-sm font-semibold">Role Permissions</p>
            <p className="text-azure-600 text-xs mt-0.5">
              <strong>Admin:</strong> View, edit & delete all tasks across the system, manage team roles. &nbsp;|&nbsp;
              <strong>Staff:</strong> View & edit only their own assigned tasks.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-white text-slate-700 text-sm placeholder-slate-400 focus:border-azure-400 focus:ring-2 focus:ring-azure-100"
          />
        </div>

        {/* Admins section */}
        {admins.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Crown size={15} className="text-purple-500" />
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Admins</h2>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">{admins.length}</span>
            </div>
            <div className="space-y-3">
              {admins.map(profile => (
                <UserRow
                  key={profile.id}
                  profile={profile}
                  currentUser={currentUser}
                  loading={loading === profile.id}
                  onRoleChange={updateRole}
                />
              ))}
            </div>
          </div>
        )}

        {/* Staff section */}
        {staff.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <UserCheck size={15} className="text-emerald-500" />
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Staff</h2>
              <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{staff.length}</span>
            </div>
            <div className="space-y-3">
              {staff.map(profile => (
                <UserRow
                  key={profile.id}
                  profile={profile}
                  currentUser={currentUser}
                  loading={loading === profile.id}
                  onRoleChange={updateRole}
                />
              ))}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
              <Users size={28} className="text-slate-300" />
            </div>
            <h3 className="font-display text-xl font-semibold text-slate-600 mb-1">No members found</h3>
            <p className="text-slate-400 text-sm">Try a different search term</p>
          </div>
        )}
      </div>
    </div>
  )
}

function UserRow({
  profile,
  currentUser,
  loading,
  onRoleChange,
}: {
  profile: Profile
  currentUser: Profile
  loading: boolean
  onRoleChange: (id: string, role: UserRole) => void
}) {
  const isMe = profile.id === currentUser.id
  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : profile.email?.[0]?.toUpperCase() || 'U'

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-4 hover:border-azure-200 transition-all"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-11 h-11 bg-azure-100 rounded-full flex items-center justify-center">
          <span className="text-azure-700 font-bold text-sm">{initials}</span>
        </div>
        {profile.role === 'admin' && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
            <Crown size={9} className="text-white" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {profile.full_name || 'No name set'}
          </p>
          {isMe && (
            <span className="text-xs bg-azure-100 text-azure-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">You</span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <Mail size={11} className="text-slate-400" />
          <p className="text-xs text-slate-500 truncate">{profile.email}</p>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Role badge */}
      <div className="flex-shrink-0">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${
          profile.role === 'admin'
            ? 'bg-purple-50 text-purple-700 border-purple-200'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {profile.role === 'admin' ? <Crown size={11} /> : <UserCheck size={11} />}
          {profile.role === 'admin' ? 'Admin' : 'Staff'}
        </span>
      </div>

      {/* Role change button */}
      {!isMe && (
        <div className="flex-shrink-0">
          {loading ? (
            <div className="w-8 h-8 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-azure-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : profile.role === 'staff' ? (
            <button
              onClick={() => onRoleChange(profile.id, 'admin')}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-all"
              title="Promote to Admin"
            >
              <Crown size={12} />
              Make Admin
            </button>
          ) : (
            <button
              onClick={() => onRoleChange(profile.id, 'staff')}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 border border-slate-200 hover:border-red-200 transition-all"
              title="Demote to Staff"
            >
              <UserX size={12} />
              Make Staff
            </button>
          )}
        </div>
      )}

      {isMe && (
        <div className="flex-shrink-0">
          <span className="text-xs text-slate-400 italic">Cannot change own role</span>
        </div>
      )}
    </div>
  )
}
