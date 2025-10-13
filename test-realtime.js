const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://bzfrmujzxmfufvumknkq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6ZnJtdWp6eG1mdWZ2dW1rbmtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1OTI5NDIsImV4cCI6MjA3NTE2ODk0Mn0.WAFT7xsTsRR35TxjXL17aodv3oF-HbJQV8Pl6ztXvlE'

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔌 Testing Supabase Realtime Subscriptions...\n')

// Test 1: Active Sessions Channel
console.log('📡 Setting up active_sessions channel...')
const activeSessions = supabase
  .channel('active-sessions-test')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'active_sessions'
    },
    (payload) => {
      console.log('🎉 Active sessions change detected!')
      console.log('   Event:', payload.eventType)
      console.log('   Data:', payload.new || payload.old)
      console.log()
    }
  )
  .subscribe((status) => {
    console.log('✅ Active sessions channel status:', status)
    if (status === 'SUBSCRIBED') {
      console.log('   Listening for changes to active_sessions table...\n')
    }
  })

// Test 2: Trips Channel
console.log('📡 Setting up trips channel...')
const trips = supabase
  .channel('trips-test')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'trips'
    },
    (payload) => {
      console.log('🎉 Trip change detected!')
      console.log('   Event:', payload.eventType)
      console.log('   Trip ID:', payload.new?.id || payload.old?.id)
      console.log('   User ID:', payload.new?.user_id || payload.old?.user_id)
      console.log('   Mode:', payload.new?.mode)
      console.log()
    }
  )
  .subscribe((status) => {
    console.log('✅ Trips channel status:', status)
    if (status === 'SUBSCRIBED') {
      console.log('   Listening for changes to trips table...\n')
    }
  })

console.log('\n⏳ Listening for realtime updates...')
console.log('   Try starting a drive in the SpeedX app!')
console.log('   Press Ctrl+C to stop\n')

// Keep script running
process.on('SIGINT', () => {
  console.log('\n\n👋 Cleaning up subscriptions...')
  supabase.removeAllChannels()
  console.log('✅ Done!')
  process.exit(0)
})
