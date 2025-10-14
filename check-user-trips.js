const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function checkUserTrips() {
  const userId = '7c5c05e1-83e7-4383-b3cb-b1c6d5d2ce40'; // The iPad user
  
  console.log('Checking trips for user:', userId);
  
  const { data: trips, error } = await supabase
    .from('trips')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(5);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`\nFound ${trips.length} trips:\n`);
  trips.forEach((trip, i) => {
    console.log(`Trip ${i + 1}:`);
    console.log(`  ID: ${trip.id}`);
    console.log(`  Started: ${trip.started_at}`);
    console.log(`  Snapshot URL: ${trip.route_snapshot_url || 'NULL ❌'}`);
    console.log('');
  });
}

checkUserTrips().then(() => process.exit(0));
