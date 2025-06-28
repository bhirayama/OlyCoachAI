'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface DebugState {
  envVars: {
    url: boolean;
    key: boolean;
  };
  session: object | null;
  profile: object | null;
  error: string | null;
}

export default function DebugPage() {
  const [debug, setDebug] = useState<DebugState>({
    envVars: {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    },
    session: null,
    profile: null,
    error: null
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          setDebug(prev => ({ ...prev, error: sessionError.message }));
          return;
        }

        setDebug(prev => ({ ...prev, session }));

        if (session) {
          // Check profile
          const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            setDebug(prev => ({ ...prev, error: profileError.message }));
            return;
          }

          setDebug(prev => ({ ...prev, profile }));
        }

      } catch (error) {
        setDebug(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error'
        }));
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Information</h1>

      <div className="space-y-6">
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Environment Variables</h2>
          <p>NEXT_PUBLIC_SUPABASE_URL: {debug.envVars.url ? '✅ Set' : '❌ Missing'}</p>
          <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {debug.envVars.key ? '✅ Set' : '❌ Missing'}</p>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Session</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(debug.session, null, 2)}
          </pre>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Profile</h2>
          <pre className="text-sm overflow-auto">
            {JSON.stringify(debug.profile, null, 2)}
          </pre>
        </div>

        {debug.error && (
          <div className="bg-red-900 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{debug.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}