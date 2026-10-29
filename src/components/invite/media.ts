// Only Supabase Storage is allowed in next.config images; pasted external URLs are served as-is.
export const unoptimized = (src: string) => !src.includes(".supabase.co/storage/v1/object/public/");
