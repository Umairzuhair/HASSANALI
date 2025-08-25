import { createServerClient } from '@supabase/ssr'

export const createClient = () => {
  return createServerClient(
    "https://sfbrnpyckebzrcjfbgwk.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmYnJucHlja2VienJjamZiZ3drIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzMTExOTAsImV4cCI6MjA2NDg4NzE5MH0.zCt9i0eQ5magByfaXhiFrO-ta6CoZJjXmE0Rn4EgAkU",
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // No-op for server-side rendering in Pages Router
        },
      },
    }
  )
}
