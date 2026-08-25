import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Shirt, Sparkles, LayoutDashboard, LogOut } from 'lucide-react'
import { LogoutButton } from './components/logout-button'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  // Fetch user profile to get credits
  let { data: profile } = await supabase
    .from('profiles')
    .select('credits_balance')
    .eq('id', user.id)
    .single()
    
  // If no profile exists (e.g. newly signed up via email but trigger hasn't fired or no trigger), fallback to 10
  const credits = profile?.credits_balance ?? 10

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="rounded-full bg-zinc-100 dark:bg-zinc-800 p-2 ring-1 ring-zinc-200 dark:ring-zinc-700">
              <Sparkles className="h-5 w-5 text-zinc-700 dark:text-zinc-300" />
            </div>
            <span className="font-bold text-xl tracking-tight text-zinc-900 dark:text-zinc-50">Wardrobe AI</span>
          </div>

          <nav className="space-y-2">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium transition-colors">
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>
            <Link href="/dashboard/wardrobe" className="flex items-center gap-3 px-3 py-2 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium transition-colors">
              <Shirt className="h-5 w-5" />
              My Wardrobe
            </Link>
          </nav>
        </div>

        <div className="p-6 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between mb-4 px-2 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
            <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> Credits
            </span>
            <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{credits}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate w-32" title={user.email}>
              {user.email}
            </div>
            <LogoutButton />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
