// lib/supabase.ts - FIXED FOR APP ROUTER
import { createBrowserClient } from '@supabase/ssr';
import type { User, Session } from '@supabase/supabase-js';

// Keep all your existing type definitions exactly as they are
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

// ✅ FIXED: Use createBrowserClient with proper cookie handling
export const supabase = createBrowserClient<Database>(
  supabaseUrl,
  supabaseKey
);