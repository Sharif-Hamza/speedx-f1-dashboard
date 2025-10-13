const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bzfrmujzxmfufvumknkq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6ZnJtdWp6eG1mdWZ2dW1rbmtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTU5Mjk0MiwiZXhwIjoyMDc1MTY4OTQyfQ.DMm6Mvj-DMynP6Xq7PlRwlV0W3QqZ17alyauOCPKG_o'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkActiveSessions() {
  console.log('🔍 Checking active_sessions table...\n')
  
  const { data, error, count } = await supabase
    .from('active_sessions')
    .select('*', { count: 'exact' })
    .order('started_at', { ascending: false })
  
  if (error) {
    console.error('❌ Error fetching active_sessions:', error.message)
    return
  }
  
  console.log(`Total active sessions: ${count || 0}\n`)
  
  if (data && data.length > 0) {
    data.forEach((session, i) => {
      console.log(`Session ${i + 1}:`)
      console.log(`  ID: ${session.id}`)
      console.log(`  User ID: ${session.user_id}`)
      console.log(`  Username: ${session.username}`)
      console.log(`  Mode: ${session.mode}`)
      console.log(`  Started: ${session.started_at}`)
      console.log(`  Last Heartbeat: ${session.last_heartbeat}`)
      console.log()
    })
  } else {
    console.log('No active sessions found.')
  }
}

checkActiveSessions()
