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

async function checkDatabase() {
  console.log('🔍 Checking trips table for route snapshots...\n');
  
  const { data: trips, error } = await supabase
    .from('trips')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error('❌ Error fetching trips:', error);
    return;
  }
  
  console.log(`Found ${trips.length} recent trips:\n`);
  
  trips.forEach((trip, idx) => {
    console.log(`Trip ${idx + 1}:`);
    console.log(`  ID: ${trip.id}`);
    console.log(`  User: ${trip.user_id}`);
    console.log(`  Started: ${trip.started_at}`);
    console.log(`  Created: ${trip.created_at}`);
    console.log(`  Route Snapshot URL: ${trip.route_snapshot_url || '❌ NULL'}`);
    console.log(`  Max Speed: ${trip.max_speed_mps} mps`);
    console.log(`  Distance: ${trip.distance_meters} meters`);
    console.log('');
  });
  
  // Check storage bucket
  console.log('\n🗂️  Checking recaps storage bucket...\n');
  
  const { data: files, error: storageError } = await supabase
    .storage
    .from('recaps')
    .list('', {
      limit: 20,
      sortBy: { column: 'created_at', order: 'desc' }
    });
  
  if (storageError) {
    console.error('❌ Error fetching storage files:', storageError);
    return;
  }
  
  console.log(`Found ${files.length} files in recaps bucket:\n`);
  
  files.forEach((file, idx) => {
    console.log(`File ${idx + 1}:`);
    console.log(`  Name: ${file.name}`);
    console.log(`  Created: ${file.created_at}`);
    console.log(`  Size: ${file.metadata?.size || 'unknown'} bytes`);
    
    // Generate public URL
    const { data: urlData } = supabase.storage
      .from('recaps')
      .getPublicUrl(file.name);
    
    console.log(`  URL: ${urlData.publicUrl}`);
    console.log('');
  });
}

checkDatabase().then(() => process.exit(0));
