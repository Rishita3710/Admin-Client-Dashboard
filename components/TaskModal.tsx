'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Task, TaskStatus, TaskPriority, Profile } from '@/types'
import { X, Loader2, Calendar, User, Building, Briefcase, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface TaskModalProps {
  task: Task | null
  profile: Profile | null
  allProfiles: Pick<Profile, 'id' | 'full_name' | 'email' | 'role'>[]
  onSave: (task: Task) => void
  onClose: () => void
}

export default function TaskModal({ task, profile, allProfiles, onSave, onClose }: TaskModalProps) {
  const isEdit = !!task
  const supabase = createClient()

  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    status: task?.status || 'pending' as TaskStatus,
    priority: task?.priority || 'medium' as TaskPriority,
    client_name: task?.client_name || '',
    matter_ref: task?.matter_ref || '',
    due_date: task?.due_date || '',
    assigned_to: task?.assigned_to || (profile?.id || ''),
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { toast.error('Title is required'); return }

    setLoading(true)

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      status: form.status,
      priority: form.priority,
      client_name: form.client_name.trim() || null,
      matter_ref: form.matter_ref.trim() || null,
      due_date: form.due_date || null,
      assigned_to: form.assigned_to || null,
    }

    try {
      if (isEdit) {
        const { data, error } = await supabase
          .from('tasks')
          .update(payload)
          .eq('id', task.id)
          .select(`*, assignee:profiles!tasks_assigned_to_fkey(id, full_name, email, avatar_url, role)`)
          .single()
        if (error) throw error
        onSave(data)
        toast.success('Task updated')
      } else {
        const { data, error } = await supabase
          .from('tasks')
          .insert({ ...payload, created_by: profile?.id })
          .select(`*, assignee:profiles!tasks_assigned_to_fkey(id, full_name, email, avatar_url, role)`)
          .single()
        if (error) throw error
        onSave(data)
        toast.success('Task created')
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save task')
    } finally {
      setLoading(false)
    }
  }

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg border border-azure-100 animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-800">
              {isEdit ? 'Edit Task' : 'Create New Task'}
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {isEdit ? 'Update task details' : 'Add a new client task'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Task Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              required
              placeholder="e.g., Review Q4 Financial Statements"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm placeholder-slate-400 focus:border-azure-400 focus:ring-2 focus:ring-azure-100 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Describe the task scope and requirements..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm placeholder-slate-400 focus:border-azure-400 focus:ring-2 focus:ring-azure-100 transition-all resize-none"
            />
          </div>

          {/* Priority + Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                <AlertCircle size={13} className="inline mr-1" />Priority
              </label>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: e.target.value as TaskPriority })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-azure-400 focus:ring-2 focus:ring-azure-100 bg-white"
              >
                <option value="critical">🔴 Critical</option>
                <option value="high">🟠 High</option>
                <option value="medium">🔵 Medium</option>
                <option value="low">⚪ Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as TaskStatus })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-azure-400 focus:ring-2 focus:ring-azure-100 bg-white"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Client + Matter Ref */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                <Building size={13} className="inline mr-1" />Client Name
              </label>
              <input
                type="text"
                value={form.client_name}
                onChange={e => setForm({ ...form, client_name: e.target.value })}
                placeholder="e.g., Acme Corp"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm placeholder-slate-400 focus:border-azure-400 focus:ring-2 focus:ring-azure-100 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                <Briefcase size={13} className="inline mr-1" />Matter Ref
              </label>
              <input
                type="text"
                value={form.matter_ref}
                onChange={e => setForm({ ...form, matter_ref: e.target.value })}
                placeholder="e.g., ACM-2024-001"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm placeholder-slate-400 focus:border-azure-400 focus:ring-2 focus:ring-azure-100 transition-all font-mono"
              />
            </div>
          </div>

          {/* Due Date + Assigned To */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                <Calendar size={13} className="inline mr-1" />Due Date
              </label>
              <input
                type="date"
                value={form.due_date}
                onChange={e => setForm({ ...form, due_date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-azure-400 focus:ring-2 focus:ring-azure-100 transition-all"
              />
            </div>
            {profile?.role === 'admin' && allProfiles.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  <User size={13} className="inline mr-1" />Assign To
                </label>
                <select
                  value={form.assigned_to}
                  onChange={e => setForm({ ...form, assigned_to: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-800 text-sm focus:border-azure-400 focus:ring-2 focus:ring-azure-100 bg-white"
                >
                  <option value="">Unassigned</option>
                  {allProfiles.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.full_name || p.email} ({p.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 bg-azure-500 hover:bg-azure-600 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
            style={{ boxShadow: '0 4px 12px rgba(12,132,234,0.3)' }}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : null}
            {isEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </div>
    </div>
  )
}
