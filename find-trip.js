const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function findTrip() {
  console.log('🔍 Searching for trip with started_at: 2025-10-13T02:56:47Z\n');
  
  const userId = 'b79eeaca-61da-4b50-9004-2b938f6ff993';
  
  // Try with Z format
  const { data: trips1, error: error1 } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .eq('started_at', '2025-10-13T02:56:47Z');
  
  console.log('Query 1 (Z format):');
  console.log('  Matches:', trips1?.length || 0);
  if (error1) console.log('  Error:', error1);
  if (trips1 && trips1.length > 0) {
    console.log('  Route Snapshot URL:', trips1[0].route_snapshot_url || 'NULL');
  }
  console.log('');
  
  // Try with +00:00 format
  const { data: trips2, error: error2 } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .eq('started_at', '2025-10-13T02:56:47+00:00');
  
  console.log('Query 2 (+00:00 format):');
  console.log('  Matches:', trips2?.length || 0);
  if (error2) console.log('  Error:', error2);
  if (trips2 && trips2.length > 0) {
    console.log('  Route Snapshot URL:', trips2[0].route_snapshot_url || 'NULL');
  }
  console.log('');
  
  // Try with no timezone suffix
  const { data: trips3, error: error3 } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .eq('started_at', '2025-10-13T02:56:47');
  
  console.log('Query 3 (no timezone):');
  console.log('  Matches:', trips3?.length || 0);
  if (error3) console.log('  Error:', error3);
  if (trips3 && trips3.length > 0) {
    console.log('  Route Snapshot URL:', trips3[0].route_snapshot_url || 'NULL');
  }
  console.log('');
  
  // Just show all trips for this user
  const { data: allTrips } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(3);
  
  console.log('Last 3 trips for this user:');
  allTrips?.forEach((trip, idx) => {
    console.log(`\nTrip ${idx + 1}:`);
    console.log(`  Started: ${trip.started_at}`);
    console.log(`  Created: ${trip.created_at}`);
    console.log(`  Snapshot: ${trip.route_snapshot_url || 'NULL'}`);
  });
}

findTrip().then(() => process.exit(0));
