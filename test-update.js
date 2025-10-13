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

async function testUpdate() {
  const userId = 'b79eeaca-61da-4b50-9004-2b938f6ff993';
  const startedAt = '2025-10-13T02:56:47Z';
  const testUrl = 'https://bzfrmujzxmfufvumknkq.supabase.co/storage/v1/object/public/recaps/route-snapshots/B79EEACA-61DA-4B50-9004-2B938F6FF993/route_E9DB9B01-47F6-4E99-B343-3E0A5C122686.jpg';
  
  console.log('🧪 Testing UPDATE operation...\n');
  console.log(`User ID: ${userId}`);
  console.log(`Started At: ${startedAt}`);
  console.log(`Test URL: ${testUrl}\n`);
  
  const { data, error, status, statusText } = await supabase
    .from('trips')
    .update({ route_snapshot_url: testUrl })
    .eq('user_id', userId)
    .eq('started_at', startedAt)
    .select();  // Add .select() to return the updated rows
  
  console.log(`Response Status: ${status} ${statusText}`);
  console.log(`Error:`, error || 'None');
  console.log(`Data:`, data);
  console.log(`\nRows updated: ${data?.length || 0}`);
  
  if (data && data.length > 0) {
    console.log('\n✅ UPDATE SUCCESSFUL!');
    console.log(`Snapshot URL is now: ${data[0].route_snapshot_url}`);
  } else {
    console.log('\n❌ UPDATE FAILED - No rows updated');
  }
  
  // Verify the update
  const { data: verifyData } = await supabase
    .from('trips')
    .select('route_snapshot_url')
    .eq('user_id', userId)
    .eq('started_at', startedAt)
    .single();
  
  console.log('\n🔍 Verification check:');
  console.log(`Current snapshot URL: ${verifyData?.route_snapshot_url || 'NULL'}`);
}

testUpdate().then(() => process.exit(0));
