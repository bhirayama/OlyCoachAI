'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface DebugState {
  // Original debug data
  envVars: {
    url: boolean;
    key: boolean;
  };
  session: object | null;
  profile: object | null;
  error: string | null;

  // NEW: Enhanced auth debugging
  authDebug: {
    environment: {
      url: string | undefined;
      anonKey: string | undefined;
      currentOrigin: string;
      userAgent: string;
    };
    supabaseConfig: {
      connectionTest: 'success' | 'failed' | 'testing';
      authSettings: any;
      error?: string;
    };
    testEmail: {
      status: 'idle' | 'sending' | 'success' | 'error';
      message: string;
      testEmailAddress: string;
    };
    urlTests: {
      currentURL: string;
      expectedCallback: string;
      isLocalhost: boolean;
      protocol: string;
    };
  };
}

export default function DebugPage() {
  const [debug, setDebug] = useState<DebugState>({
    envVars: {
      url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    },
    session: null,
    profile: null,
    error: null,
    authDebug: {
      environment: {
        url: undefined,
        anonKey: undefined,
        currentOrigin: '',
        userAgent: ''
      },
      supabaseConfig: {
        connectionTest: 'testing',
        authSettings: null
      },
      testEmail: {
        status: 'idle',
        message: '',
        testEmailAddress: 'test@example.com'
      },
      urlTests: {
        currentURL: '',
        expectedCallback: '',
        isLocalhost: false,
        protocol: ''
      }
    }
  });

  useEffect(() => {
    // Original auth check
    checkAuth();

    // NEW: Enhanced environment check
    if (typeof window !== 'undefined') {
      const environment = {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Present (hidden)' : undefined,
        currentOrigin: window.location.origin,
        userAgent: navigator.userAgent
      };

      const urlTests = {
        currentURL: window.location.href,
        expectedCallback: `${window.location.origin}/auth/callback`,
        isLocalhost: window.location.hostname === 'localhost',
        protocol: window.location.protocol
      };

      setDebug(prev => ({
        ...prev,
        authDebug: {
          ...prev.authDebug,
          environment,
          urlTests
        }
      }));

      // Test Supabase connection
      testSupabaseConnection();
    }
  }, []);

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

  const testSupabaseConnection = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        setDebug(prev => ({
          ...prev,
          authDebug: {
            ...prev.authDebug,
            supabaseConfig: {
              connectionTest: 'failed',
              authSettings: null,
              error: error.message
            }
          }
        }));
        return;
      }

      const authSettings = {
        session: data.session ? 'Active session found' : 'No active session',
        timestamp: new Date().toISOString(),
        sessionData: data.session ? {
          userId: data.session.user.id,
          email: data.session.user.email,
          emailConfirmed: data.session.user.email_confirmed_at ? true : false
        } : null
      };

      setDebug(prev => ({
        ...prev,
        authDebug: {
          ...prev.authDebug,
          supabaseConfig: {
            connectionTest: 'success',
            authSettings,
            error: undefined
          }
        }
      }));

    } catch (error) {
      setDebug(prev => ({
        ...prev,
        authDebug: {
          ...prev.authDebug,
          supabaseConfig: {
            connectionTest: 'failed',
            authSettings: null,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }));
    }
  };

  const testEmailVerification = async () => {
    setDebug(prev => ({
      ...prev,
      authDebug: {
        ...prev.authDebug,
        testEmail: {
          ...prev.authDebug.testEmail,
          status: 'sending',
          message: 'Sending test verification email...'
        }
      }
    }));

    try {
      const { error } = await supabase.auth.signUp({
        email: debug.authDebug.testEmail.testEmailAddress,
        password: 'TestPassword123!',
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          setDebug(prev => ({
            ...prev,
            authDebug: {
              ...prev.authDebug,
              testEmail: {
                ...prev.authDebug.testEmail,
                status: 'success',
                message: '✅ Email system working! (User already exists, which means emails can be sent)'
              }
            }
          }));
        } else {
          setDebug(prev => ({
            ...prev,
            authDebug: {
              ...prev.authDebug,
              testEmail: {
                ...prev.authDebug.testEmail,
                status: 'error',
                message: `❌ Error: ${error.message}`
              }
            }
          }));
        }
      } else {
        setDebug(prev => ({
          ...prev,
          authDebug: {
            ...prev.authDebug,
            testEmail: {
              ...prev.authDebug.testEmail,
              status: 'success',
              message: '✅ Test verification email sent successfully! Check the email for the link format.'
            }
          }
        }));
      }
    } catch (error) {
      setDebug(prev => ({
        ...prev,
        authDebug: {
          ...prev.authDebug,
          testEmail: {
            ...prev.authDebug.testEmail,
            status: 'error',
            message: `❌ Exception: ${error instanceof Error ? error.message : 'Unknown error'}`
          }
        }
      }));
    }
  };

  const copyDebugInfo = () => {
    const debugInfo = JSON.stringify(debug, null, 2);
    navigator.clipboard.writeText(debugInfo);
    alert('Debug information copied to clipboard!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-400 bg-green-900/20';
      case 'failed': case 'error': return 'text-red-400 bg-red-900/20';
      case 'testing': case 'sending': return 'text-yellow-400 bg-yellow-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">🔧 Enhanced Debug Information</h1>
          <p className="text-gray-400">Supabase configuration and auth debugging</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
          >
            ← Back to Home
          </button>
        </div>

        {/* Environment Variables */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🌍 Environment Variables
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-400">NEXT_PUBLIC_SUPABASE_URL</p>
              <p className={debug.envVars.url ? 'text-green-400' : 'text-red-400'}>
                {debug.envVars.url ? '✅ Set' : '❌ Missing'}
              </p>
              {debug.authDebug.environment.url && (
                <p className="text-xs text-gray-500 font-mono">{debug.authDebug.environment.url}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-400">NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
              <p className={debug.envVars.key ? 'text-green-400' : 'text-red-400'}>
                {debug.envVars.key ? '✅ Set' : '❌ Missing'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Current Origin</p>
              <p className="text-blue-400 font-mono text-sm">{debug.authDebug.environment.currentOrigin}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Protocol</p>
              <p className={debug.authDebug.urlTests.protocol === 'https:' ? 'text-green-400' : 'text-yellow-400'}>
                {debug.authDebug.urlTests.protocol}
                {debug.authDebug.urlTests.isLocalhost && ' (localhost - OK for dev)'}
              </p>
            </div>
          </div>
        </div>

        {/* URL Configuration */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🔗 URL Configuration Check
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Expected Callback URL</p>
              <p className="text-blue-400 font-mono text-sm bg-gray-900 p-2 rounded">
                {debug.authDebug.urlTests.expectedCallback}
              </p>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
              <p className="font-semibold text-yellow-400 mb-2">⚠️ Required Supabase Dashboard Settings</p>
              <div className="text-sm text-yellow-200 space-y-1">
                <p>1. Go to Supabase Dashboard → Authentication → URL Configuration</p>
                <p>2. Add this URL to "Redirect URLs":
                  <span className="font-mono bg-gray-800 px-2 py-1 rounded ml-1">
                    {debug.authDebug.urlTests.expectedCallback}
                  </span>
                </p>
                <p>3. Set Site URL to:
                  <span className="font-mono bg-gray-800 px-2 py-1 rounded ml-1">
                    {debug.authDebug.environment.currentOrigin}
                  </span>
                </p>
                <p>4. Enable email confirmations in Auth Settings</p>
              </div>
            </div>
          </div>
        </div>

        {/* Supabase Connection Test */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            🔗 Supabase Connection Test
          </h2>
          <div className={`p-4 rounded-lg ${getStatusColor(debug.authDebug.supabaseConfig.connectionTest)}`}>
            <div className="font-semibold">
              Status: {debug.authDebug.supabaseConfig.connectionTest}
            </div>
            {debug.authDebug.supabaseConfig.error && (
              <div className="text-sm mt-2">Error: {debug.authDebug.supabaseConfig.error}</div>
            )}
            {debug.authDebug.supabaseConfig.authSettings && (
              <pre className="text-xs mt-2 overflow-auto">
                {JSON.stringify(debug.authDebug.supabaseConfig.authSettings, null, 2)}
              </pre>
            )}
          </div>
          <button
            onClick={testSupabaseConnection}
            className="mt-4 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
          >
            Retest Connection
          </button>
        </div>

        {/* Email Verification Test */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            📧 Email Verification Test
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Test Email Address</label>
              <input
                type="email"
                value={debug.authDebug.testEmail.testEmailAddress}
                onChange={(e) => setDebug(prev => ({
                  ...prev,
                  authDebug: {
                    ...prev.authDebug,
                    testEmail: { ...prev.authDebug.testEmail, testEmailAddress: e.target.value }
                  }
                }))}
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2"
                placeholder="test@example.com"
              />
            </div>

            {debug.authDebug.testEmail.message && (
              <div className={`p-4 rounded-lg ${getStatusColor(debug.authDebug.testEmail.status)}`}>
                {debug.authDebug.testEmail.message}
              </div>
            )}

            <button
              onClick={testEmailVerification}
              disabled={debug.authDebug.testEmail.status === 'sending'}
              className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 px-4 py-2 rounded transition-colors"
            >
              {debug.authDebug.testEmail.status === 'sending' ? 'Sending...' : 'Test Email Verification'}
            </button>
          </div>
        </div>

        {/* Original Session & Profile Data */}
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

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center pt-6">
          <button
            onClick={copyDebugInfo}
            className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg transition-colors"
          >
            📋 Copy All Debug Info
          </button>
          <button
            onClick={() => window.location.reload()}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg transition-colors"
          >
            🔄 Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}