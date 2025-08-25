
import { useState, useEffect, createContext, useContext } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { cleanupAuthState } from '@/utils/authCleanup';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authEvent: AuthChangeEvent | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authEvent, setAuthEvent] = useState<AuthChangeEvent | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        setAuthEvent(event);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Clean up on sign out
        if (event === 'SIGNED_OUT') {
          cleanupAuthState();
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');
      
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error('Sign out error:', error);
        // Even if there's an error, continue with cleanup
      }
      
      // Force clear local state
      setUser(null);
      setSession(null);
      setAuthEvent('SIGNED_OUT');
      
      console.log('Sign out completed');
    } catch (error) {
      console.error('Sign out failed:', error);
      // Force cleanup even on error
      cleanupAuthState();
      setUser(null);
      setSession(null);
    }
  };

  const value = {
    user,
    session,
    loading,
    authEvent,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Return default state when context is not available (e.g., during SSR)
    return {
      user: null,
      session: null,
      loading: false,
      authEvent: null,
      signOut: async () => {},
    };
  }
  return context;
};
