import 'server-only'

// Run a server-side data load without crashing the page; the caller shows `error` instead.
export async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<{ data: T; error: string }> {
  try {
    return { data: await fn(), error: '' }
  } catch (e) {
    console.error(e)
    const msg = e instanceof Error ? e.message : String(e)
    const hint = /PGRST125|404/.test(msg)
      ? 'Check that SUPABASE_URL is just the project URL (https://<ref>.supabase.co) and that supabase/schema.sql has been run.'
      : /PGRST205|42P01/.test(msg)
        ? 'The tables are missing. Run supabase/schema.sql in the Supabase SQL editor.'
        : /401|403|JWT|apikey/i.test(msg)
          ? 'Supabase rejected the key. Check SUPABASE_SECRET_KEY.'
          : 'Could not reach Supabase.'
    return { data: fallback, error: hint }
  }
}
