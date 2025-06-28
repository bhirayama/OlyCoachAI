// app/auth/callback/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthCallbackPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('🔐 Auth callback: Starting auth code exchange')

      try {
        // Exchange the auth code for a session
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('❌ Auth callback error:', error)
          router.push('/auth?error=callback_failed')
          return
        }

        if (data.session) {
          console.log('✅ Auth callback: Session established', {
            user: !!data.session.user,
            email: data.session.user?.email
          })

          // Successful authentication - redirect to dashboard
          router.push('/dashboard')
        } else {
          console.log('❌ Auth callback: No session found')
          router.push('/auth?error=no_session')
        }
      } catch (error) {
        console.error('❌ Auth callback exception:', error)
        router.push('/auth?error=callback_exception')
      }
    }

    handleAuthCallback()
  }, [router, supabase.auth])

  return (
    <div className="min-h-screen bg-navy-primary flex items-center justify-center p-4">
      <div className="bg-navy-secondary rounded-xl p-8 text-center">
        <div className="w-12 h-12 border-4 border-electric-blue/30 border-t-electric-blue rounded-full animate-spin mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-text-primary mb-2">
          Completing Sign Up...
        </h1>
        <p className="text-text-secondary">
          Please wait while we set up your account.
        </p>
      </div>
    </div>
  )
}