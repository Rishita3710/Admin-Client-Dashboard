'use client'

import { useState, useMemo, useTransition } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Task, TaskStatus, TaskPriority, Profile } from '@/types'
import {
  Plus, Search, Filter, Clock, CheckCircle2, AlertCircle,
  Calendar, Tag, User, Building, Briefcase, Trash2, Edit3,
  ChevronDown, XCircle, TrendingUp, Activity, AlertTriangle
} from 'lucide-react'
import { formatDistanceToNow, isPast, parseISO, differenceInDays } from 'date-fns'
import toast from 'react-hot-toast'
import TaskModal from './TaskModal'

interface TaskDashboardProps {
  initialTasks: Task[]
  profile: Profile | null
  allProfiles: Pick<Profile, 'id' | 'full_name' | 'email' | 'role'>[]
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; icon: any }> = {
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Clock },
  in_progress: { label: 'In Progress', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Activity },
  completed: { label: 'Completed', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bg: string; dot: string }> = {
  critical: { label: 'Critical', color: 'text-red-700', bg: 'bg-red-50 border-red-200', dot: 'bg-red-500' },
  high: { label: 'High', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', dot: 'bg-orange-500' },
  medium: { label: 'Medium', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-400' },
  low: { label: 'Low', color: 'text-slate-600', bg: 'bg-slate-50 border-slate-200', dot: 'bg-slate-400' },
}

function OverdueWarning({ dueDate }: { dueDate: string }) {
  const date = parseISO(dueDate)
  const daysOverdue = differenceInDays(new Date(), date)

  return (
    <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
      <AlertTriangle size={12} className="overdue-indicator flex-shrink-0" />
      <span>{daysOverdue === 0 ? 'Due today' : `${daysOverdue}d overdue`}</span>
    </div>
  )
}

function TaskCard({
  task,
  profile,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  task: Task
  profile: Profile | null
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, status: TaskStatus) => void
}) {
  const isOverdue = task.due_date && task.status !== 'completed' && isPast(parseISO(task.due_date))
  const statusCfg = STATUS_CONFIG[task.status]
  const priorityCfg = PRIORITY_CONFIG[task.priority]
  const StatusIcon = statusCfg.icon
  const isAdmin = profile?.role === 'admin'

  return (
    <div className={`task-card p-5 cursor-pointer group ${isOverdue ? 'overdue' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          {/* Priority + overdue */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${priorityCfg.bg} ${priorityCfg.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityCfg.dot}`} />
              {priorityCfg.label}
            </span>
            {isOverdue && task.due_date && <OverdueWarning dueDate={task.due_date} />}
          </div>
          <h3 className="text-slate-800 font-semibold text-sm leading-snug line-clamp-2 group-hover:text-azure-700 transition-colors">
            {task.title}
          </h3>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(task) }}
            className="w-7 h-7 rounded-lg hover:bg-azure-50 text-slate-400 hover:text-azure-600 flex items-center justify-center transition-all"
          >
            <Edit3 size={13} />
          </button>
          {isAdmin && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(task.id) }}
              className="w-7 h-7 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 flex items-center justify-center transition-all"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-slate-500 text-xs leading-relaxed mb-3 line-clamp-2">{task.description}</p>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-3 flex-wrap mb-3">
        {task.client_name && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Building size={11} />
            <span className="font-medium">{task.client_name}</span>
          </div>
        )}
        {task.matter_ref && (
          <div className="flex items-center gap-1 text-xs text-slate-400 font-mono">
            <Briefcase size={11} />
            {task.matter_ref}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {/* Status selector */}
          <div className="relative group/status">
            <button
              onClick={(e) => e.stopPropagation()}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-all ${statusCfg.bg} ${statusCfg.color}`}
            >
              <StatusIcon size={11} />
              {statusCfg.label}
              <ChevronDown size={10} />
            </button>
            {/* Dropdown */}
            <div className="absolute bottom-full left-0 mb-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden hidden group-hover/status:block z-20 min-w-36">
              {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
                const Icon = cfg.icon
                return (
                  <button
                    key={status}
                    onClick={() => onStatusChange(task.id, status as TaskStatus)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-slate-50 transition-colors ${cfg.color} ${task.status === status ? 'bg-slate-50' : ''}`}
                  >
                    <Icon size={12} />
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Assignee */}
          {(task as any).assignee && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <div className="w-5 h-5 bg-azure-100 rounded-full flex items-center justify-center">
                <span className="text-azure-700 font-bold text-[9px]">
                  {((task as any).assignee?.full_name || (task as any).assignee?.email || 'U')[0].toUpperCase()}
                </span>
              </div>
              <span className="hidden sm:block">
                {(task as any).assignee?.full_name || (task as any).assignee?.email}
              </span>
            </div>
          )}

          {/* Due date */}
          {task.due_date && (
            <div className={`flex items-center gap-1 text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
              <Calendar size={11} />
              {isOverdue
                ? formatDistanceToNow(parseISO(task.due_date), { addSuffix: true })
                : new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TaskDashboard({ initialTasks, profile, allProfiles }: TaskDashboardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all' | 'overdue'>('all')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isPending, startTransition] = useTransition()
  const supabase = createClient()

  // Compute stats
  const stats = useMemo(() => {
    const total = tasks.length
    const pending = tasks.filter(t => t.status === 'pending').length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const completed = tasks.filter(t => t.status === 'completed').length
    const overdue = tasks.filter(t =>
      t.due_date && t.status !== 'completed' && isPast(parseISO(t.due_date))
    ).length
    const critical = tasks.filter(t => t.priority === 'critical' && t.status !== 'completed').length
    return { total, pending, inProgress, completed, overdue, critical }
  }, [tasks])

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (statusFilter === 'overdue') {
        if (!task.due_date || task.status === 'completed' || !isPast(parseISO(task.due_date))) return false
      } else if (statusFilter !== 'all') {
        if (task.status !== statusFilter) return false
      }
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        return (
          task.title.toLowerCase().includes(q) ||
          task.client_name?.toLowerCase().includes(q) ||
          task.matter_ref?.toLowerCase().includes(q) ||
          task.description?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [tasks, statusFilter, priorityFilter, searchQuery])

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const prev = [...tasks]
    setTasks(t => t.map(task =>
      task.id === taskId
        ? { ...task, status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : null }
        : task
    ))

    const { error } = await supabase
      .from('tasks')
      .update({ status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : null })
      .eq('id', taskId)

    if (error) {
      setTasks(prev)
      toast.error('Failed to update status')
    } else {
      toast.success('Status updated')
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('Delete this task? This action cannot be undone.')) return
    const prev = [...tasks]
    setTasks(t => t.filter(task => task.id !== taskId))

    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (error) {
      setTasks(prev)
      toast.error('Failed to delete task')
    } else {
      toast.success('Task deleted')
    }
  }

  const handleTaskSave = (savedTask: Task) => {
    setTasks(prev => {
      const exists = prev.find(t => t.id === savedTask.id)
      if (exists) return prev.map(t => t.id === savedTask.id ? savedTask : t)
      return [savedTask, ...prev]
    })
    setShowModal(false)
    setEditingTask(null)
  }

  const openEdit = (task: Task) => {
    setEditingTask(task)
    setShowModal(true)
  }

  const openCreate = () => {
    setEditingTask(null)
    setShowModal(true)
  }

  const statusFilters: { key: TaskStatus | 'all' | 'overdue'; label: string; count: number }[] = [
    { key: 'all', label: 'All Tasks', count: stats.total },
    { key: 'pending', label: 'Pending', count: stats.pending },
    { key: 'in_progress', label: 'In Progress', count: stats.inProgress },
    { key: 'completed', label: 'Completed', count: stats.completed },
    { key: 'overdue', label: '⚠ Overdue', count: stats.overdue },
  ]

  return (
    <div className="h-full flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-100 px-8 py-5 flex items-center justify-between flex-shrink-0"
        style={{ boxShadow: '0 1px 8px rgba(12,132,234,0.04)' }}>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-800">
            {profile?.role === 'admin' ? 'Task Overview' : 'My Tasks'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-azure-500 hover:bg-azure-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
          style={{ boxShadow: '0 4px 12px rgba(12,132,234,0.3)' }}
        >
          <Plus size={16} />
          New Task
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total Tasks" value={stats.total} icon={<Activity size={20} className="text-azure-400" />} color="azure" />
          <StatCard label="In Progress" value={stats.inProgress} icon={<TrendingUp size={20} className="text-blue-400" />} color="blue" />
          <StatCard label="Completed" value={stats.completed} icon={<CheckCircle2 size={20} className="text-emerald-400" />} color="emerald" />
          <StatCard
            label="Overdue"
            value={stats.overdue}
            icon={<AlertCircle size={20} className="text-red-400" />}
            color="red"
            alert={stats.overdue > 0}
          />
        </div>

        {/* Filters + search */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Status filters */}
          <div className="flex items-center gap-2 flex-wrap">
            {statusFilters.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`filter-btn ${statusFilter === key ? 'active' : ''}`}
              >
                {label}
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                  statusFilter === key ? 'bg-white/20' : 'bg-slate-100'
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Priority filter */}
            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value as TaskPriority | 'all')}
              className="text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-600 bg-white focus:border-azure-400 focus:ring-2 focus:ring-azure-100"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Search */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search tasks, clients..."
                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-white focus:border-azure-400 focus:ring-2 focus:ring-azure-100 text-slate-700 placeholder-slate-400 w-64"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <XCircle size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Task grid */}
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-azure-50 rounded-2xl flex items-center justify-center mb-4">
              <CheckCircle2 size={28} className="text-azure-300" />
            </div>
            <h3 className="font-display text-xl font-semibold text-slate-600 mb-1">No tasks found</h3>
            <p className="text-slate-400 text-sm">
              {searchQuery ? 'Try different search terms' : 'Create a new task to get started'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 stagger-children">
            {filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                profile={profile}
                onEdit={openEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Modal */}
      {showModal && (
        <TaskModal
          task={editingTask}
          profile={profile}
          allProfiles={allProfiles}
          onSave={handleTaskSave}
          onClose={() => { setShowModal(false); setEditingTask(null) }}
        />
      )}
    </div>
  )
}

function StatCard({
  label, value, icon, color, alert
}: {
  label: string
  value: number
  icon: React.ReactNode
  color: string
  alert?: boolean
}) {
  const colorMap: Record<string, string> = {
    azure: 'from-azure-50 to-white',
    blue: 'from-blue-50 to-white',
    emerald: 'from-emerald-50 to-white',
    red: 'from-red-50 to-white',
  }

  return (
    <div className={`stat-card bg-gradient-to-br ${colorMap[color]} ${alert && value > 0 ? 'border-red-200' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
          {icon}
        </div>
        {alert && value > 0 && (
          <span className="flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
        )}
      </div>
      <div className="text-3xl font-display font-bold text-slate-800 mb-0.5">{value}</div>
      <div className="text-xs text-slate-500 font-medium">{label}</div>
    </div>
  )
}
