import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/register')
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')

  // Redirect to login if accessing dashboard without auth
  if (isDashboard && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Redirect to dashboard if accessing auth pages while logged in
  if (isAuthPage && user) {
    const url = request.nextUrl.clone()
    
    // Get user role from profiles table (NOT from metadata)
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('🔍 Proxy - User ID:', user.id)
    console.log('🔍 Proxy - Profile:', profile)
    console.log('🔍 Proxy - Error:', error)

    if (error || !profile) {
      console.error('❌ Proxy - Profile not found, redirecting to login')
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    console.log('✅ Proxy - Redirecting to:', `/dashboard/${profile.role}`)
    url.pathname = `/dashboard/${profile.role}`
    return NextResponse.redirect(url)
  }

  return response
}