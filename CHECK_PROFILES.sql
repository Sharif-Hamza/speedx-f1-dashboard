-- Check profiles table structure and sample data
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check sample profiles data
SELECT * FROM profiles LIMIT 5;

-- Check if user_ids from blitz_points exist in profiles
SELECT 
  bp.user_id,
  p.id,
  p.*
FROM blitz_points bp
LEFT JOIN profiles p ON bp.user_id = p.id
LIMIT 10;
