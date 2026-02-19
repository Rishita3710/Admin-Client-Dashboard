import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import TaskDashboard from '@/components/TaskDashboard'

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch tasks with assignee info
  const { data: tasks } = await supabase
    .from('tasks')
    .select(`
      *,
      assignee:profiles!tasks_assigned_to_fkey(id, full_name, email, avatar_url, role)
    `)
    .order('created_at', { ascending: false })

  // Fetch all profiles for assignment dropdown (admin can assign to anyone)
  let allProfiles = null
  if (profile?.role === 'admin') {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, role')
      .order('full_name')
    allProfiles = data
  }

  return (
    <TaskDashboard
      initialTasks={tasks || []}
      profile={profile}
      allProfiles={allProfiles || []}
    />
  )
}
