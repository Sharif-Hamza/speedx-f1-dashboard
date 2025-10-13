const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  'https://bzfrmujzxmfufvumknkq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6ZnJtdWp6eG1mdWZ2dW1rbmtxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1OTI5NDIsImV4cCI6MjA3NTE2ODk0Mn0.WAFT7xsTsRR35TxjXL17aodv3oF-HbJQV8Pl6ztXvlE'
)

async function checkTrips() {
  console.log('🔍 Checking trips in database...\n')
  
  const { data: trips, error } = await supabase
    .from('trips')
    .select('id, mode, max_speed_mps, distance_m, route_snapshot_url, started_at')
    .order('started_at', { ascending: false })
    .limit(5)
  
  if (error) {
    console.error('❌ Error:', error)
    return
  }
  
  console.log(`Found ${trips.length} recent trips:\n`)
  
  trips.forEach((trip, i) => {
    console.log(`Trip ${i + 1}:`)
    console.log(`  ID: ${trip.id}`)
    console.log(`  Mode: ${trip.mode}`)
    console.log(`  Max Speed: ${(trip.max_speed_mps * 2.23694).toFixed(1)} mph`)
    console.log(`  Distance: ${(trip.distance_m * 0.000621371).toFixed(2)} mi`)
    console.log(`  Started: ${trip.started_at}`)
    console.log(`  Route Snapshot URL: ${trip.route_snapshot_url || 'NULL - MISSING!'}`)
    
    // Check if URL is accessible
    if (trip.route_snapshot_url) {
      console.log(`  ✅ URL exists in database`)
    } else {
      console.log(`  ❌ URL IS NULL IN DATABASE!`)
    }
    console.log('')
  })
}

checkTrips()
