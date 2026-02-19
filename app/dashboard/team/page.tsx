import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import TeamManager from '@/components/TeamManager'

export default async function TeamPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Only admins can access this page
  if (profile?.role !== 'admin') {
    redirect('/dashboard')
  }

  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return <TeamManager profiles={allProfiles || []} currentUser={profile} />
}
