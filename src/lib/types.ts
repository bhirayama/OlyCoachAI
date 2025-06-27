// src/lib/types.ts
export interface UserProfile {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;

  // Demographics
  age?: number;
  bodyweight?: number;
  bodyweight_unit: 'kg' | 'lbs';
  training_experience_years?: number;

  // Performance
  snatch_1rm?: number;
  clean_jerk_1rm?: number;
  front_squat_1rm?: number;
  back_squat_1rm?: number;

  // Preferences
  sessions_per_week?: number;
  session_duration_minutes?: number;
  primary_weakness?: WeaknessType;
  secondary_weakness?: WeaknessType;

  // Goals
  primary_goal?: GoalType;
  goal_timeline_weeks: number;
  snatch_target_increase?: number;
  clean_jerk_target_increase?: number;

  // Status
  onboarding_completed: boolean;
  onboarding_step: number;
}

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

export interface TrainingSession {
  id: string;
  program_id: string;
  user_id: string;
  session_date: string;
  week_number: number;
  session_focus: string;

  // Readiness data
  sleep_quality?: number;
  stress_level?: number;
  motivation?: number;
  soreness_level?: number;
  readiness_score?: number;

  // Status
  started_at?: string;
  completed_at?: string;
  session_notes?: string;

  // Related data
  exercises?: ExercisePrescription[];
}

export interface ExercisePrescription {
  id: string;
  session_id: string;
  exercise_name: string;
  exercise_variation?: string;
  order_in_session: number;
  sets: number;
  reps: number;
  prescribed_weight?: number;
  percent_1rm?: number;
  target_rpe?: number;
  coaching_cues?: string[];

  // Completed sets
  completions?: SetCompletion[];
}

export interface SetCompletion {
  id: string;
  prescription_id: string;
  set_number: number;
  prescribed_weight: number;
  actual_weight: number;
  prescribed_reps: number;
  actual_reps: number;
  user_rpe: number;
  target_rpe: number;
  technical_quality: 'perfect' | 'good' | 'rough';
  set_notes?: string;
  completed_at: string;
}