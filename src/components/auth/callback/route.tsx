// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🔐 Auth callback API: Processing request')

  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    console.error('❌ Auth callback: No code parameter')
    return NextResponse.redirect(new URL('/auth?error=no_code', request.url))
  }

  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('❌ Auth callback: Code exchange failed:', error)
      return NextResponse.redirect(new URL('/auth?error=exchange_failed', request.url))
    }

    if (data.session) {
      console.log('✅ Auth callback: Session created successfully', {
        user: !!data.session.user,
        email: data.session.user?.email
      })

      // Redirect to dashboard on success
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      console.error('❌ Auth callback: No session in response')
      return NextResponse.redirect(new URL('/auth?error=no_session', request.url))
    }

  } catch (error) {
    console.error('❌ Auth callback: Exception occurred:', error)
    return NextResponse.redirect(new URL('/auth?error=callback_exception', request.url))
  }
}