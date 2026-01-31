// ============================================
// SEED USERS
// ============================================
// This script creates auth users + profiles using Supabase Admin API
// Run: npx tsx scripts/seed-users.ts
import 'dotenv/config';  
import { createClient } from '@supabase/supabase-js'

// ⚠️ IMPORTANT: Add this to your .env.local
// SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
// Get it from: Supabase Dashboard > Settings > API > service_role key

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing environment variables!')
  console.error('Make sure you have:')
  console.error('- NEXT_PUBLIC_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

type UserData = {
  email: string
  password: string
  name: string
  role: 'admin' | 'guru' | 'siswa'
  school_id?: string
  education_level_id?: string
  class_id?: string
}

// ============================================
// USER DATA TO SEED
// ============================================
const usersToSeed: UserData[] = [
  // ============================================
  // ADMINS (2 users)
  // ============================================
  {
    email: 'admin@quizplatform.com',
    password: 'admin123456',
    name: 'Admin Utama',
    role: 'admin',
  },
  {
    email: 'admin2@quizplatform.com',
    password: 'admin123456',
    name: 'Admin Kedua',
    role: 'admin',
  },

  // ============================================
  // GURU - SMA (4 users)
  // ============================================
  {
    email: 'guru.math.sma@test.com',
    password: 'guru123456',
    name: 'Pak Budi - Guru Matematika',
    role: 'guru',
    school_id: 'school-sma-1', // SMA Negeri 3 Yogyakarta
    education_level_id: 'ed-level-sma',
  },
  {
    email: 'guru.physics.sma@test.com',
    password: 'guru123456',
    name: 'Bu Siti - Guru Fisika',
    role: 'guru',
    school_id: 'school-sma-1', // SMA Negeri 3 Yogyakarta
    education_level_id: 'ed-level-sma',
  },
  {
    email: 'guru.chemistry.sma@test.com',
    password: 'guru123456',
    name: 'Pak Ahmad - Guru Kimia',
    role: 'guru',
    school_id: 'school-sma-2', // SMA Negeri 8 Yogyakarta
    education_level_id: 'ed-level-sma',
  },
  {
    email: 'guru.biology.sma@test.com',
    password: 'guru123456',
    name: 'Bu Dewi - Guru Biologi',
    role: 'guru',
    school_id: 'school-sma-2', // SMA Negeri 8 Yogyakarta
    education_level_id: 'ed-level-sma',
  },

  // ============================================
  // GURU - SMP (2 users)
  // ============================================
  {
    email: 'guru.math.smp@test.com',
    password: 'guru123456',
    name: 'Pak Joko - Guru Matematika',
    role: 'guru',
    school_id: 'school-smp-1', // SMP Negeri 5 Yogyakarta
    education_level_id: 'ed-level-smp',
  },
  {
    email: 'guru.ipa.smp@test.com',
    password: 'guru123456',
    name: 'Bu Rina - Guru IPA',
    role: 'guru',
    school_id: 'school-smp-1', // SMP Negeri 5 Yogyakarta
    education_level_id: 'ed-level-smp',
  },

  // ============================================
  // SISWA - SMA Kelas 12 IPA (5 users)
  // ============================================
  {
    email: 'siswa.sma.1@test.com',
    password: 'siswa123456',
    name: 'Andi Pratama',
    role: 'siswa',
    school_id: 'school-sma-1',
    education_level_id: 'ed-level-sma',
    class_id: 'class-sma-12-ipa',
  },
  {
    email: 'siswa.sma.2@test.com',
    password: 'siswa123456',
    name: 'Budi Santoso',
    role: 'siswa',
    school_id: 'school-sma-1',
    education_level_id: 'ed-level-sma',
    class_id: 'class-sma-12-ipa',
  },
  {
    email: 'siswa.sma.3@test.com',
    password: 'siswa123456',
    name: 'Citra Wijaya',
    role: 'siswa',
    school_id: 'school-sma-1',
    education_level_id: 'ed-level-sma',
    class_id: 'class-sma-12-ipa',
  },
  {
    email: 'siswa.sma.4@test.com',
    password: 'siswa123456',
    name: 'Dina Lestari',
    role: 'siswa',
    school_id: 'school-sma-2',
    education_level_id: 'ed-level-sma',
    class_id: 'class-sma-12-ipa',
  },
  {
    email: 'siswa.sma.5@test.com',
    password: 'siswa123456',
    name: 'Eka Putra',
    role: 'siswa',
    school_id: 'school-sma-2',
    education_level_id: 'ed-level-sma',
    class_id: 'class-sma-12-ipa',
  },

  // ============================================
  // SISWA - SMA Kelas 11 IPA (3 users)
  // ============================================
  {
    email: 'siswa.sma.6@test.com',
    password: 'siswa123456',
    name: 'Fajar Ramadhan',
    role: 'siswa',
    school_id: 'school-sma-1',
    education_level_id: 'ed-level-sma',
    class_id: 'class-sma-11-ipa',
  },
  {
    email: 'siswa.sma.7@test.com',
    password: 'siswa123456',
    name: 'Gita Permata',
    role: 'siswa',
    school_id: 'school-sma-1',
    education_level_id: 'ed-level-sma',
    class_id: 'class-sma-11-ipa',
  },
  {
    email: 'siswa.sma.8@test.com',
    password: 'siswa123456',
    name: 'Hendra Saputra',
    role: 'siswa',
    school_id: 'school-sma-2',
    education_level_id: 'ed-level-sma',
    class_id: 'class-sma-11-ipa',
  },

  // ============================================
  // SISWA - SMP (4 users)
  // ============================================
  {
    email: 'siswa.smp.1@test.com',
    password: 'siswa123456',
    name: 'Indra Gunawan',
    role: 'siswa',
    school_id: 'school-smp-1',
    education_level_id: 'ed-level-smp',
    class_id: 'class-smp-9',
  },
  {
    email: 'siswa.smp.2@test.com',
    password: 'siswa123456',
    name: 'Jasmine Putri',
    role: 'siswa',
    school_id: 'school-smp-1',
    education_level_id: 'ed-level-smp',
    class_id: 'class-smp-9',
  },
  {
    email: 'siswa.smp.3@test.com',
    password: 'siswa123456',
    name: 'Krisna Wijaya',
    role: 'siswa',
    school_id: 'school-smp-1',
    education_level_id: 'ed-level-smp',
    class_id: 'class-smp-8',
  },
  {
    email: 'siswa.smp.4@test.com',
    password: 'siswa123456',
    name: 'Lina Marlina',
    role: 'siswa',
    school_id: 'school-smp-1',
    education_level_id: 'ed-level-smp',
    class_id: 'class-smp-8',
  },
]

// ============================================
// SEED FUNCTION
// ============================================
async function seedUsers() {
  console.log('🌱 Starting user seeding...\n')

  let successCount = 0
  let errorCount = 0

  for (const userData of usersToSeed) {
    try {
      console.log(`📝 Creating user: ${userData.email}`)

      // 1. Create auth user
      const { data: authUser, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email: userData.email,
          password: userData.password,
          email_confirm: true, // Auto confirm email
          user_metadata: {
            role: userData.role,
          },
        })

      if (authError) {
        // Check if user already exists
        if (authError.message.includes('already registered')) {
          console.log(`⚠️  User already exists: ${userData.email}`)
          console.log('   Skipping...\n')
          continue
        }
        throw authError
      }

      if (!authUser.user) {
        throw new Error('User creation failed - no user returned')
      }

      console.log(`   ✅ Auth user created: ${authUser.user.id}`)

      // 2. Create profile
      const { error: profileError } = await supabaseAdmin.from('profiles').insert({
        id: authUser.user.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        school_id: userData.school_id || null,
        education_level_id: userData.education_level_id || null,
        class_id: userData.class_id || null,
      })

      if (profileError) {
        // If profile already exists, update it instead
        if (profileError.code === '23505') {
          // Unique constraint violation
          const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update({
              name: userData.name,
              role: userData.role,
              school_id: userData.school_id || null,
              education_level_id: userData.education_level_id || null,
              class_id: userData.class_id || null,
            })
            .eq('id', authUser.user.id)

          if (updateError) {
            throw updateError
          }

          console.log(`   ✅ Profile updated`)
        } else {
          throw profileError
        }
      } else {
        console.log(`   ✅ Profile created`)
      }

      console.log(`   ✅ Complete: ${userData.name} (${userData.role})\n`)
      successCount++
    } catch (error) {
      console.error(`   ❌ Error creating ${userData.email}:`, error)
      errorCount++
      console.log()
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 SEEDING SUMMARY')
  console.log('='.repeat(50))
  console.log(`✅ Success: ${successCount} users`)
  console.log(`❌ Errors: ${errorCount} users`)
  console.log(`📝 Total: ${usersToSeed.length} users`)
  console.log('='.repeat(50) + '\n')

  // Show credentials for testing
  console.log('🔑 TEST CREDENTIALS:')
  console.log('='.repeat(50))
  console.log('\n👤 ADMIN:')
  console.log('   Email: admin@quizplatform.com')
  console.log('   Password: admin123456')
  console.log('\n👨‍🏫 GURU (SMA):')
  console.log('   Email: guru.math.sma@test.com')
  console.log('   Password: guru123456')
  console.log('\n👨‍🎓 SISWA (SMA 12 IPA):')
  console.log('   Email: siswa.sma.1@test.com')
  console.log('   Password: siswa123456')
  console.log('\n' + '='.repeat(50))
}

// ============================================
// RUN SEED
// ============================================
seedUsers()
  .then(() => {
    console.log('\n✅ Seeding completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error)
    process.exit(1)
  })