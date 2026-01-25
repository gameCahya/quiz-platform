'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { RegisterData, LoginData } from '@/types/auth'

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
    return { error: signUpError.message }
  }

  if (!authData.user) {
    console.error('❌ No user returned')
    return { error: 'Failed to create user' }
  }

  console.log('✅ Auth user created:', authData.user.id)

  // 2. Prepare profile data
  const profileData: any = {
    id: authData.user.id,
    email: data.email,
    name: data.name,
    role: data.role,
  }

  // Add foreign keys only for guru/siswa (not admin)
  if (data.role !== 'admin') {
    if (data.school_id) {
      profileData.school_id = data.school_id
    }
    if (data.education_level_id) {
      profileData.education_level_id = data.education_level_id
    }
    if (data.class_id) {
      profileData.class_id = data.class_id
    }
  }

  console.log('📝 Creating profile with data:', profileData)

  // 3. Insert profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert(profileData)

  if (profileError) {
    console.error('❌ Profile insert error:', profileError)
    console.error('Error details:', {
      message: profileError.message,
      details: profileError.details,
      hint: profileError.hint,
      code: profileError.code
    })
    
    // Rollback: delete auth user
    await supabase.auth.admin.deleteUser(authData.user.id)
    
    return { 
      error: `Profile creation failed: ${profileError.message}`
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
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    console.error('❌ Profile not found:', profileError)
    return { error: 'Profile not found' }
  }

  console.log('✅ Profile loaded, role:', profile.role)

  revalidatePath('/', 'layout')
  
  return {
    success: true,
    redirectTo: `/dashboard/${profile.role}`
  }
}

export async function logout() {
  const supabase = await createClient()
  
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  
  return {
    success: true,
    redirectTo: '/login'
  }
}
