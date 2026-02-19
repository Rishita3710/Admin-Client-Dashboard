'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import toast from 'react-hot-toast'
import { Mail, Lock, Eye, EyeOff, Building2, ArrowRight, Shield, User, KeyRound } from 'lucide-react'

type Mode = 'login' | 'signup'
type SelectedRole = 'staff' | 'admin'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [adminCode, setAdminCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showAdminCode, setShowAdminCode] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [mode, setMode] = useState<Mode>('login')
  const [selectedRole, setSelectedRole] = useState<SelectedRole>('staff')

  const supabase = createClient()

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        toast.success('Welcome back!')
        window.location.href = '/dashboard'
      } else {
        let finalRole: SelectedRole = 'staff'

        if (selectedRole === 'admin') {
          const correctCode = process.env.NEXT_PUBLIC_ADMIN_CODE || 'admin123'
          if (adminCode !== correctCode) {
            toast.error('Invalid admin code. Registering as Staff instead.')
            finalRole = 'staff'
          } else {
            finalRole = 'admin'
          }
        }

        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error

        if (data.user) {
          await supabase
            .from('profiles')
            .update({ role: finalRole })
            .eq('id', data.user.id)
        }

        toast.success(finalRole === 'admin'
          ? 'Admin account created! You can now sign in.'
          : 'Account created! Check your email to verify.')
        setMode('login')
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setIsGoogleLoading(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      toast.error(error.message)
      setIsGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen mesh-bg flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-azure-800 via-azure-700 to-azure-600 p-12 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-azure-500 opacity-20" />
        <div className="absolute -bottom-32 -right-16 w-80 h-80 rounded-full bg-azure-900 opacity-30" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Building2 size={22} className="text-white" />
            </div>
            <span className="text-white/90 font-display text-xl font-semibold">TaskFlow</span>
          </div>
          <p className="text-azure-200 text-sm">Financial Client Management</p>
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="font-display text-5xl font-bold text-white leading-tight mb-4">
              Manage client<br />work with<br />
              <span className="text-azure-200">precision.</span>
            </h1>
            <p className="text-azure-100/80 text-lg leading-relaxed">
              Role-based access control, real-time status tracking, and overdue alerts built for financial firms.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div className="glass-dark rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-lg bg-purple-400/30 flex items-center justify-center">
                  <Shield size={15} className="text-purple-200" />
                </div>
                <p className="text-white font-semibold text-sm">Admin Role</p>
              </div>
              <p className="text-azure-200/70 text-xs leading-relaxed pl-11">
                View, edit & delete all tasks. Manage team and assign work.
              </p>
            </div>
            <div className="glass-dark rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-lg bg-azure-400/30 flex items-center justify-center">
                  <User size={15} className="text-azure-200" />
                </div>
                <p className="text-white font-semibold text-sm">Staff Role</p>
              </div>
              <p className="text-azure-200/70 text-xs leading-relaxed pl-11">
                View and manage only your own assigned tasks.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-azure-300/60 text-xs">
          © 2024 TaskFlow. Enterprise financial task management.
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md page-enter">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-azure-500 rounded-xl flex items-center justify-center">
              <Building2 size={22} className="text-white" />
            </div>
            <span className="font-display text-xl font-semibold text-azure-800">TaskFlow</span>
          </div>

          <div className="bg-white rounded-3xl shadow-card border border-azure-100 p-8">
            <h2 className="font-display text-3xl font-bold text-slate-800 mb-1">
              {mode === 'login' ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              {mode === 'login' ? 'Sign in to your workspace' : 'Join your team on TaskFlow'}
            </p>

            {/* Role selector — signup only */}
            {mode === 'signup' && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  I am joining as
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Staff */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole('staff')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                      selectedRole === 'staff'
                        ? 'border-azure-500 bg-azure-50'
                        : 'border-slate-200 bg-white hover:border-azure-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      selectedRole === 'staff' ? 'bg-azure-500' : 'bg-slate-100'
                    }`}>
                      <User size={20} className={selectedRole === 'staff' ? 'text-white' : 'text-slate-500'} />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-bold ${selectedRole === 'staff' ? 'text-azure-700' : 'text-slate-700'}`}>
                        Staff
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">My assigned tasks</p>
                    </div>
                    {selectedRole === 'staff' && (
                      <div className="w-5 h-5 bg-azure-500 rounded-full flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" width="12" height="12">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>

                  {/* Admin */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole('admin')}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 ${
                      selectedRole === 'admin'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-slate-200 bg-white hover:border-purple-200'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      selectedRole === 'admin' ? 'bg-purple-500' : 'bg-slate-100'
                    }`}>
                      <Shield size={20} className={selectedRole === 'admin' ? 'text-white' : 'text-slate-500'} />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-bold ${selectedRole === 'admin' ? 'text-purple-700' : 'text-slate-700'}`}>
                        Admin
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">Full access</p>
                    </div>
                    {selectedRole === 'admin' && (
                      <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" width="12" height="12">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Google */}
            <button
              onClick={handleGoogleAuth}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 hover:border-azure-300 hover:bg-azure-50 transition-all duration-200 text-slate-700 font-medium text-sm mb-5"
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-2 border-azure-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              )}
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs text-slate-400 font-medium">or continue with email</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="you@firm.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm placeholder-slate-400 focus:border-azure-400 focus:ring-2 focus:ring-azure-100 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm placeholder-slate-400 focus:border-azure-400 focus:ring-2 focus:ring-azure-100 transition-all"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Admin secret code */}
              {mode === 'signup' && selectedRole === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Admin Secret Code
                  </label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400" />
                    <input
                      type={showAdminCode ? 'text' : 'password'}
                      value={adminCode}
                      onChange={e => setAdminCode(e.target.value)}
                      placeholder="Enter admin secret code"
                      className="w-full pl-11 pr-12 py-3 rounded-xl border border-purple-200 bg-purple-50 text-slate-800 text-sm placeholder-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all"
                    />
                    <button type="button" onClick={() => setShowAdminCode(!showAdminCode)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showAdminCode ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="text-xs text-purple-600 mt-1.5 flex items-center gap-1">
                    <Shield size={11} />
                    Contact your system administrator for the admin code
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mt-2 ${
                  mode === 'signup' && selectedRole === 'admin'
                    ? 'bg-purple-500 hover:bg-purple-600'
                    : 'bg-azure-500 hover:bg-azure-600'
                }`}
                style={{
                  boxShadow: mode === 'signup' && selectedRole === 'admin'
                    ? '0 4px 16px rgba(168,85,247,0.3)'
                    : '0 4px 16px rgba(12,132,234,0.3)'
                }}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : `Sign Up as ${selectedRole === 'admin' ? 'Admin' : 'Staff'}`}
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-azure-600 hover:text-azure-700 font-medium"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
