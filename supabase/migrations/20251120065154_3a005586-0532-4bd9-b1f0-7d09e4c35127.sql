-- Make attachments bucket public so files can be displayed
UPDATE storage.buckets 
SET public = true 
WHERE id = 'attachments';

-- Create RLS policy for public read access to attachments
CREATE POLICY "Public read access for attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'attachments');