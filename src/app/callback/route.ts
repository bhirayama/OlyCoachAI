// app/auth/callback/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🔐 Auth callback: Processing verification')

  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  console.log('🔍 Auth callback: Code received:', code ? 'YES' : 'NO')

  if (!code) {
    console.error('❌ Auth callback: No authorization code found')
    return NextResponse.redirect(new URL('/auth?error=no_code', request.url))
  }

  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({
      cookies: () => cookieStore
    })

    console.log('🔄 Auth callback: Exchanging code for session')

    // Exchange the code for a user session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('❌ Auth callback: Code exchange failed:', error.message)
      return NextResponse.redirect(new URL('/auth?error=exchange_failed', request.url))
    }

    if (data.session && data.session.user) {
      console.log('✅ Auth callback: Success! User authenticated:', {
        email: data.session.user.email,
        id: data.session.user.id
      })

      // SUCCESS: Redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      console.error('❌ Auth callback: No session created')
      return NextResponse.redirect(new URL('/auth?error=no_session', request.url))
    }

  } catch (error) {
    console.error('❌ Auth callback: Exception:', error)
    return NextResponse.redirect(new URL('/auth?error=callback_exception', request.url))
  }
}