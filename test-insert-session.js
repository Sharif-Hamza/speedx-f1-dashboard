const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bzfrmujzxmfufvumknkq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6ZnJtdWp6eG1mdWZ2dW1rbmtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTU5Mjk0MiwiZXhwIjoyMDc1MTY4OTQyfQ.DMm6Mvj-DMynP6Xq7PlRwlV0W3QqZ17alyauOCPKG_o'

const supabase = createClient(supabaseUrl, supabaseKey)

async function insertTestSession() {
  console.log('🔥 Inserting test active session...\n')
  
  const now = new Date().toISOString()
  
  const { data, error } = await supabase
    .from('active_sessions')
    .insert({
      user_id: 'b79eeaca-61da-4b50-9004-2b938f6ff993',
      username: 'areenxo',
      mode: 'blitz',
      started_at: now,
      last_heartbeat: now
    })
    .select()
  
  if (error) {
    console.error('❌ Error inserting session:', error)
    return
  }
  
  console.log('✅ Test session inserted:', data)
  console.log('\n🎯 Now check your dashboard - you should see 1 active user!')
  console.log('📍 Session will auto-expire in 30 seconds due to stale heartbeat filter')
}

insertTestSession()
