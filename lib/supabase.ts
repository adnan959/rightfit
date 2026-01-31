import { createClient } from '@supabase/supabase-js';

// Supabase client for server-side operations
// Uses service role key for full database access (bypasses RLS)

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl) {
  console.warn('Missing NEXT_PUBLIC_SUPABASE_URL - Supabase features will be disabled');
}

// Server-side client with service role (full access)
// Use this for API routes and server components
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// Client-side client with anon key (respects RLS)
// Use this for client components if needed
export const supabaseClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseServiceKey);
};

// Storage bucket name for CV files
export const CV_STORAGE_BUCKET = 'cv-files';

// Helper to upload a file to Supabase Storage
export async function uploadFile(
  bucket: string,
  path: string,
  file: Buffer | Blob,
  contentType: string
): Promise<{ path: string; error: Error | null }> {
  if (!supabaseAdmin) {
    return { path: '', error: new Error('Supabase not configured') };
  }

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, {
      contentType,
      upsert: true,
    });

  if (error) {
    return { path: '', error: new Error(error.message) };
  }

  return { path: data.path, error: null };
}

// Helper to get a signed URL for a private file
export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<{ url: string; error: Error | null }> {
  if (!supabaseAdmin) {
    return { url: '', error: new Error('Supabase not configured') };
  }

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  if (error) {
    return { url: '', error: new Error(error.message) };
  }

  return { url: data.signedUrl, error: null };
}

// Helper to delete a file from Supabase Storage
export async function deleteFile(
  bucket: string,
  path: string
): Promise<{ error: Error | null }> {
  if (!supabaseAdmin) {
    return { error: new Error('Supabase not configured') };
  }

  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    return { error: new Error(error.message) };
  }

  return { error: null };
}

// Helper to download a file from Supabase Storage
export async function downloadFile(
  bucket: string,
  path: string
): Promise<{ data: Blob | null; error: Error | null }> {
  if (!supabaseAdmin) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .download(path);

  if (error) {
    return { data: null, error: new Error(error.message) };
  }

  return { data, error: null };
}
