-- Allow short pre-wedding videos in the media bucket.
-- The story timeline and video list live in event.config (jsonb), so no table changes are needed.
-- The per-type limits (15MB for images/audio, 50MB for video) are checked in createUpload; Storage enforces the overall cap.

update storage.buckets
   set file_size_limit = 50 * 1024 * 1024,
       allowed_mime_types = array[
         'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif',
         'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/wav', 'audio/x-m4a',
         'video/mp4', 'video/webm', 'video/quicktime'
       ]
 where id = 'media';
