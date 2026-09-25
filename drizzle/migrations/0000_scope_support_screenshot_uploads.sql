DROP POLICY IF EXISTS "Anyone can upload a support screenshot" ON storage.objects;
CREATE POLICY "Signed-in users upload screenshots to their own folder" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'support-screenshots' AND (storage.foldername(name))[1] = auth.uid()::text);