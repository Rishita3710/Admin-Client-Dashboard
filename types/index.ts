export type TaskStatus = 'pending' | 'in_progress' | 'completed'
export type TaskPriority = 'critical' | 'high' | 'medium' | 'low'
export type UserRole = 'staff' | 'admin'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
}

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  client_name: string | null
  matter_ref: string | null
  assigned_to: string | null
  created_by: string | null
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  // Joined fields
  assignee?: Profile | null
}

export interface TaskWithAssignee extends Task {
  assignee: Profile | null
}
