-- Storage Buckets for Photos
-- Create buckets for user photos and avatars

-- Create photos bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'photos',
  'photos',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create avatars bucket (public) - optional, can reuse photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152, -- 2MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for photos bucket
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view all public photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'photos');

CREATE POLICY "Users can update their own photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for avatars bucket
CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view all public avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
