import { ref, computed } from 'vue'
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import { useRuntimeConfig } from '#app'

const user        = ref<User | null>(null)
const loading     = ref(true)
let   supabase: SupabaseClient | null = null

function getSupabase(): SupabaseClient {
  if (supabase) return supabase
  const { public: pub } = useRuntimeConfig()
  supabase = createClient(pub.supabaseUrl as string, pub.supabaseAnonKey as string, {
    auth: { persistSession: true, detectSessionInUrl: true },
  })
  return supabase
}

export function useCurrentUser() {
  if (import.meta.client && !supabase) {
    const sb = getSupabase()
    sb.auth.getSession().then(({ data }) => {
      user.value    = data.session?.user ?? null
      loading.value = false
    })
    sb.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null
    })
  }

  const auth = {
    async signOut() {
      await getSupabase().auth.signOut()
      user.value = null
    },
    async googleSignIn() {
      return getSupabase().auth.signInWithOAuth({
        provider: 'google',
        options : { redirectTo: window.location.origin },
      })
    },
    async emailSignIn({ email }: { email: string }) {
      return getSupabase().auth.signInWithOtp({
        email,
        options: { emailRedirectTo: window.location.origin },
      })
    },
  }

  return {
    user       : computed(() => user.value),
    userLoading: computed(() => loading.value),
    auth,
  }
}
