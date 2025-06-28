// lib/supabase.ts - Enhanced for SSR and code exchange
import { createBrowserClient } from '@supabase/ssr';
import type { User, Session } from '@supabase/supabase-js';

// Keep all your existing type definitions
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          created_at: string;
          updated_at: string;
          age?: number;
          bodyweight?: number;
          bodyweight_unit: 'kg' | 'lbs';
          training_experience_years?: number;
          snatch_1rm?: number;
          clean_jerk_1rm?: number;
          front_squat_1rm?: number;
          back_squat_1rm?: number;
          sessions_per_week?: number;
          session_duration_minutes?: number;
          primary_weakness?: WeaknessType;
          secondary_weakness?: WeaknessType;
          primary_goal?: GoalType;
          goal_timeline_weeks: number;
          snatch_target_increase?: number;
          clean_jerk_target_increase?: number;
          onboarding_completed: boolean;
          onboarding_step: number;
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string;
          updated_at?: string;
          age?: number;
          bodyweight?: number;
          bodyweight_unit?: 'kg' | 'lbs';
          training_experience_years?: number;
          snatch_1rm?: number;
          clean_jerk_1rm?: number;
          front_squat_1rm?: number;
          back_squat_1rm?: number;
          sessions_per_week?: number;
          session_duration_minutes?: number;
          primary_weakness?: WeaknessType;
          secondary_weakness?: WeaknessType;
          primary_goal?: GoalType;
          goal_timeline_weeks?: number;
          snatch_target_increase?: number;
          clean_jerk_target_increase?: number;
          onboarding_completed?: boolean;
          onboarding_step?: number;
        };
        Update: {
          id?: string;
          email?: string;
          updated_at?: string;
          age?: number;
          bodyweight?: number;
          bodyweight_unit?: 'kg' | 'lbs';
          training_experience_years?: number;
          snatch_1rm?: number;
          clean_jerk_1rm?: number;
          front_squat_1rm?: number;
          back_squat_1rm?: number;
          sessions_per_week?: number;
          session_duration_minutes?: number;
          primary_weakness?: WeaknessType;
          secondary_weakness?: WeaknessType;
          primary_goal?: GoalType;
          goal_timeline_weeks?: number;
          snatch_target_increase?: number;
          clean_jerk_target_increase?: number;
          onboarding_completed?: boolean;
          onboarding_step?: number;
        };
      };
    };
  };
};

export type WeaknessType =
  | 'overhead_stability'
  | 'receiving_position'
  | 'explosive_power'
  | 'consistency'
  | 'mobility';

export type GoalType =
  | 'strength_increase'
  | 'competition_prep'
  | 'technique_improvement'
  | 'general_fitness';

export type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
export type { User, Session };

// Environment variables validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// ✅ ENHANCED: Browser client with better configuration
export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseKey,
  {
    // ✅ NEW: Better cookie handling for auth
    cookies: {
      get: (name: string) => {
        if (typeof document !== 'undefined') {
          const cookies = document.cookie.split(';');
          for (const cookie of cookies) {
            const [key, value] = cookie.trim().split('=');
            if (key === name) {
              return decodeURIComponent(value);
            }
          }
        }
        return undefined;
      },
      set: (name: string, value: string, options?: any) => {
        if (typeof document !== 'undefined') {
          let cookieString = `${name}=${encodeURIComponent(value)}`;
          if (options?.maxAge) cookieString += `; max-age=${options.maxAge}`;
          if (options?.path) cookieString += `; path=${options.path}`;
          if (options?.domain) cookieString += `; domain=${options.domain}`;
          if (options?.secure) cookieString += `; secure`;
          if (options?.httpOnly) cookieString += `; httponly`;
          if (options?.sameSite) cookieString += `; samesite=${options.sameSite}`;
          document.cookie = cookieString;
        }
      },
      remove: (name: string, options?: any) => {
        if (typeof document !== 'undefined') {
          let cookieString = `${name}=; max-age=0`;
          if (options?.path) cookieString += `; path=${options.path}`;
          if (options?.domain) cookieString += `; domain=${options.domain}`;
          document.cookie = cookieString;
        }
      }
    }
  }
);