'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { RegisterData, LoginData } from '@/types/auth'
import type { ProfileInsert } from '@/types/database'
import { redirect } from 'next/navigation'

export async function register(data: RegisterData) {
  const supabase = await createClient()

  console.log('🚀 Starting registration for:', data.email, 'as', data.role)

  // 1. Create auth user
  const { data: authData, error: signUpError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
        role: data.role,
      },
    },
  })

  if (signUpError) {
    console.error('❌ Sign up error:', signUpError)
    
    // Check if it's rate limit error
    if (signUpError.message.includes('rate limit')) {
      return { 
        error: 'Too many registration attempts. Please try again in 1 hour or contact admin.'
      }
    }
    
    return { error: signUpError.message }
  }

  if (!authData.user) {
    console.error('❌ No user returned')
    return { error: 'Failed to create user' }
  }

  console.log('✅ Auth user created:', authData.user.id)

  // 2. Check if profile already exists (edge case)
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', authData.user.id)
    .single()

  if (existingProfile) {
    console.log('ℹ️ Profile already exists, skipping insert')
    revalidatePath('/', 'layout')
    return { 
      success: true,
      redirectTo: `/dashboard/${data.role}`
    }
  }

  // 3. Prepare profile data - FIX: Replace `any` with proper type

  const profileData: ProfileInsert = {
    id: authData.user.id,
    email: data.email,
    name: data.name,
    role: data.role,
    school_id: null,
    education_level_id: null,
    class_id: null,
  }

  if (data.role !== 'admin') {
    if (data.school_id) profileData.school_id = data.school_id
    if (data.education_level_id) profileData.education_level_id = data.education_level_id
    if (data.class_id) profileData.class_id = data.class_id
  }

  console.log('📝 Creating profile with data:', profileData)

  // 4. Insert profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert(profileData)

  if (profileError) {
    console.error('❌ Profile insert error:', profileError)
    
    return { 
      error: `Profile creation failed: ${profileError.message}. User account was created but profile is incomplete. Please contact admin.`,
      userId: authData.user.id
    }
  }

  console.log('✅ Profile created successfully!')

  revalidatePath('/', 'layout')
  
  return { 
    success: true,
    redirectTo: `/dashboard/${data.role}`
  }
}

export async function login(data: LoginData) {
  const supabase = await createClient()

  console.log('🔐 Attempting login for:', data.email)

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  })

  if (error) {
    console.error('❌ Login error:', error)
    return { error: error.message }
  }

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'User not found' }
  }

  console.log('✅ User authenticated:', user.id)

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, name, email')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.error('❌ Profile not found:', profileError)
    return { error: 'Profile not found. Please contact admin.' }
  }

  console.log('✅ Profile loaded:', profile)
  console.log('✅ Redirecting to:', `/dashboard/${profile.role}`)

  revalidatePath('/', 'layout')
  
  return {
    success: true,
    redirectTo: `/dashboard/${profile.role}`
  }
}

export async function logout() {
  const supabase = await createClient()

  // Sign out from Supabase
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Logout error:', error)
    return {
      success: false,
      error: error.message,
    }
  }

  // Revalidate all pages to clear cached data
  revalidatePath('/', 'layout')

  // Redirect to login page
  redirect('/login')
}
