-- The "bloom" theme can use short looping MP4/WebM clips for its floral frame and intro.
update storage.buckets
   set allowed_mime_types = array[
         'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif',
         'audio/mpeg', 'audio/mp3', 'audio/mp4', 'audio/aac', 'audio/ogg', 'audio/wav', 'audio/x-m4a',
         'video/mp4', 'video/webm'
       ]
 where id = 'media';
