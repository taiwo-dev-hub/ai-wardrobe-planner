'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Mail, Lock, Loader2, Sparkles, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSplit, setIsSplit] = useState(false)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplit(true)
    }, 600)
    return () => clearTimeout(timer)
  }, [])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        if (error) throw error
        setError('Check your email for the confirmation link.')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.')
    } finally {
      setIsLoading(false)
    }
  }

  const authFormContent = (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
          {isLogin ? 'Welcome back' : 'Create an account'}
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {isLogin ? 'Sign in to access your wardrobe.' : 'Start curating your digital identity today.'}
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleAuth}>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950/50 dark:text-red-400 rounded-xl flex items-start gap-2 border border-red-200 dark:border-red-900/50"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Mail className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full rounded-2xl border-0 py-4 pl-12 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-900 dark:focus:ring-zinc-100 sm:text-sm sm:leading-6 transition-all"
                placeholder="Email address"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <div className="relative group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Lock className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-zinc-100 transition-colors" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-2xl border-0 py-4 pl-12 pr-12 text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-zinc-900 dark:focus:ring-zinc-100 sm:text-sm sm:leading-6 transition-all"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center items-center gap-2 rounded-2xl bg-zinc-900 dark:bg-zinc-100 px-4 py-4 text-sm font-semibold text-white dark:text-zinc-900 shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {!isLoading && (isLogin ? 'Sign in' : 'Create account')}
          {!isLoading && <ArrowRight className="w-4 h-4 ml-1" />}
        </button>
      </form>

      <div className="mt-8 text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin)
            setError(null)
          }}
          className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )

  const formVariants = {
    initial: {
      opacity: 0,
      y: 20,
    },
    split: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.2, // Delay starts after the clip-path animation triggers (600ms)
        type: 'spring' as const,
        stiffness: 200,
        damping: 20
      }
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 overflow-hidden flex flex-col md:flex-row">
      
      {/* Background for the auth form side (Right) */}
      <div className="absolute inset-0 w-full h-full md:flex justify-end hidden">
        <div className="w-full md:w-1/2 lg:w-3/5 h-full bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-8 lg:p-24 relative z-0 pl-16">
          <motion.div 
            className="w-full max-w-md ml-auto"
            variants={formVariants}
            initial="initial"
            animate={isSplit ? 'split' : 'initial'}
          >
            {authFormContent}
          </motion.div>
        </div>
      </div>

      {/* Hero Panel (Left / Full) */}
      <div 
        className={`
          relative md:absolute inset-0 z-10 flex flex-col justify-center bg-zinc-900 dark:bg-zinc-950 text-white p-8 md:p-16 lg:p-24 overflow-hidden
          transition-[clip-path] duration-1000 ease-[cubic-bezier(0.76,0,0.24,1)]
          [clip-path:polygon(0_0,100%_0,100%_100%,0_100%)]
          md:[&.is-split]:[clip-path:polygon(0_0,60%_0,40%_100%,0_100%)]
          ${isSplit ? 'is-split' : ''}
        `}
      >
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-zinc-500 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-lg md:w-[45%]">
          <div className="rounded-2xl bg-white/10 p-3 w-fit ring-1 ring-white/20 mb-8 backdrop-blur-md">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
            Curate your digital identity.
          </h1>
          <p className="text-lg text-zinc-400">
            AI-powered wardrobe management, tagging, and outfit curation. Your style, simplified.
          </p>
        </div>
      </div>

      {/* Mobile-only Auth Form (Stacked) */}
      <div className="md:hidden flex-1 flex flex-col justify-center px-6 py-12 z-20 bg-zinc-50 dark:bg-zinc-950">
        <motion.div 
          className="w-full max-w-md mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {authFormContent}
        </motion.div>
      </div>

    </div>
  )
}
