export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: { extensions?: Json; operationName?: string; query?: string; variables?: Json };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      athlete_profiles: {
        Row: {
          athlete_id: string;
          long_term_goal: string | null;
          program_start_date: string | null;
          short_term_goal: string | null;
          updated_at: string;
        };
        ComputedFields: never;
        Insert: {
          athlete_id: string;
          long_term_goal?: string | null;
          program_start_date?: string | null;
          short_term_goal?: string | null;
          updated_at?: string;
        };
        Update: {
          athlete_id?: string;
          long_term_goal?: string | null;
          program_start_date?: string | null;
          short_term_goal?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "athlete_profiles_athlete_id_fkey";
            columns: ["athlete_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      body_measurements: {
        Row: {
          athlete_id: string;
          calf_left_cm: number | null;
          calf_right_cm: number | null;
          chest_cm: number | null;
          created_at: string;
          glute_cm: number | null;
          id: string;
          left_bicep_cm: number | null;
          measured_on: string;
          quad_left_cm: number | null;
          quad_right_cm: number | null;
          right_bicep_cm: number | null;
          waist_cm: number | null;
        };
        ComputedFields: never;
        Insert: {
          athlete_id: string;
          calf_left_cm?: number | null;
          calf_right_cm?: number | null;
          chest_cm?: number | null;
          created_at?: string;
          glute_cm?: number | null;
          id?: string;
          left_bicep_cm?: number | null;
          measured_on: string;
          quad_left_cm?: number | null;
          quad_right_cm?: number | null;
          right_bicep_cm?: number | null;
          waist_cm?: number | null;
        };
        Update: {
          athlete_id?: string;
          calf_left_cm?: number | null;
          calf_right_cm?: number | null;
          chest_cm?: number | null;
          created_at?: string;
          glute_cm?: number | null;
          id?: string;
          left_bicep_cm?: number | null;
          measured_on?: string;
          quad_left_cm?: number | null;
          quad_right_cm?: number | null;
          right_bicep_cm?: number | null;
          waist_cm?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "body_measurements_athlete_id_fkey";
            columns: ["athlete_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      coach_athlete_assignments: {
        Row: {
          assigned_at: string;
          athlete_id: string;
          coach_id: string;
          id: string;
          is_active: boolean;
          unassigned_at: string | null;
        };
        ComputedFields: never;
        Insert: {
          assigned_at?: string;
          athlete_id: string;
          coach_id: string;
          id?: string;
          is_active?: boolean;
          unassigned_at?: string | null;
        };
        Update: {
          assigned_at?: string;
          athlete_id?: string;
          coach_id?: string;
          id?: string;
          is_active?: boolean;
          unassigned_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "coach_athlete_assignments_athlete_id_fkey";
            columns: ["athlete_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "coach_athlete_assignments_coach_id_fkey";
            columns: ["coach_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      daily_checkins: {
        Row: {
          athlete_id: string;
          checkin_date: string;
          created_at: string;
          id: string;
          sleep_minutes: number | null;
          steps: number | null;
          stress_score: number | null;
          updated_at: string;
          weight_fasted_kg: number | null;
        };
        ComputedFields: never;
        Insert: {
          athlete_id: string;
          checkin_date: string;
          created_at?: string;
          id?: string;
          sleep_minutes?: number | null;
          steps?: number | null;
          stress_score?: number | null;
          updated_at?: string;
          weight_fasted_kg?: number | null;
        };
        Update: {
          athlete_id?: string;
          checkin_date?: string;
          created_at?: string;
          id?: string;
          sleep_minutes?: number | null;
          steps?: number | null;
          stress_score?: number | null;
          updated_at?: string;
          weight_fasted_kg?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "daily_checkins_athlete_id_fkey";
            columns: ["athlete_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      diets: {
        Row: {
          athlete_id: string;
          coach_id: string;
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          phase: string | null;
          starts_on: string | null;
        };
        ComputedFields: never;
        Insert: {
          athlete_id: string;
          coach_id: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          phase?: string | null;
          starts_on?: string | null;
        };
        Update: {
          athlete_id?: string;
          coach_id?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          phase?: string | null;
          starts_on?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "diets_athlete_id_fkey";
            columns: ["athlete_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "diets_coach_id_fkey";
            columns: ["coach_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      exercise_library: {
        Row: {
          coach_id: string;
          created_at: string;
          default_notes: string | null;
          id: string;
          muscle_group: string | null;
          name: string;
          video_url: string | null;
        };
        ComputedFields: never;
        Insert: {
          coach_id: string;
          created_at?: string;
          default_notes?: string | null;
          id?: string;
          muscle_group?: string | null;
          name: string;
          video_url?: string | null;
        };
        Update: {
          coach_id?: string;
          created_at?: string;
          default_notes?: string | null;
          id?: string;
          muscle_group?: string | null;
          name?: string;
          video_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "exercise_library_coach_id_fkey";
            columns: ["coach_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      invitations: {
        Row: {
          accepted_at: string | null;
          coach_id: string;
          created_at: string;
          email: string;
          expires_at: string;
          id: string;
        };
        ComputedFields: never;
        Insert: {
          accepted_at?: string | null;
          coach_id: string;
          created_at?: string;
          email: string;
          expires_at?: string;
          id?: string;
        };
        Update: {
          accepted_at?: string | null;
          coach_id?: string;
          created_at?: string;
          email?: string;
          expires_at?: string;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invitations_coach_id_fkey";
            columns: ["coach_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      meal_logs: {
        Row: {
          athlete_id: string;
          chosen_option_id: string | null;
          completed_at: string;
          id: string;
          log_date: string;
          meal_id: string;
        };
        ComputedFields: never;
        Insert: {
          athlete_id: string;
          chosen_option_id?: string | null;
          completed_at?: string;
          id?: string;
          log_date?: string;
          meal_id: string;
        };
        Update: {
          athlete_id?: string;
          chosen_option_id?: string | null;
          completed_at?: string;
          id?: string;
          log_date?: string;
          meal_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meal_logs_athlete_id_fkey";
            columns: ["athlete_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meal_logs_chosen_option_id_athlete_id_fkey";
            columns: ["chosen_option_id", "athlete_id"];
            isOneToOne: false;
            referencedRelation: "meal_options";
            referencedColumns: ["id", "athlete_id"];
          },
          {
            foreignKeyName: "meal_logs_meal_id_athlete_id_fkey";
            columns: ["meal_id", "athlete_id"];
            isOneToOne: false;
            referencedRelation: "meals";
            referencedColumns: ["id", "athlete_id"];
          },
        ];
      };
      meal_option_items: {
        Row: {
          athlete_id: string;
          food_name: string;
          id: string;
          meal_option_id: string;
          position: number;
          quantity: number;
          unit: string;
        };
        ComputedFields: never;
        Insert: {
          athlete_id: string;
          food_name: string;
          id?: string;
          meal_option_id: string;
          position: number;
          quantity: number;
          unit?: string;
        };
        Update: {
          athlete_id?: string;
          food_name?: string;
          id?: string;
          meal_option_id?: string;
          position?: number;
          quantity?: number;
          unit?: string;
        };
        Relationships: [
          {
            foreignKeyName: "meal_option_items_meal_option_id_athlete_id_fkey";
            columns: ["meal_option_id", "athlete_id"];
            isOneToOne: false;
            referencedRelation: "meal_options";
            referencedColumns: ["id", "athlete_id"];
          },
        ];
      };
      meal_options: {
        Row: {
          athlete_id: string;
          id: string;
          label: string;
          meal_id: string;
          position: number;
        };
        ComputedFields: never;
        Insert: {
          athlete_id: string;
          id?: string;
          label: string;
          meal_id: string;
          position: number;
        };
        Update: {
          athlete_id?: string;
          id?: string;
          label?: string;
          meal_id?: string;
          position?: number;
        };
        Relationships: [
          {
            foreignKeyName: "meal_options_meal_id_athlete_id_fkey";
            columns: ["meal_id", "athlete_id"];
            isOneToOne: false;
            referencedRelation: "meals";
            referencedColumns: ["id", "athlete_id"];
          },
        ];
      };
      meals: {
        Row: {
          athlete_id: string;
          diet_id: string;
          id: string;
          name: string;
          position: number;
          target_carbs_g: number | null;
          target_fats_g: number | null;
          target_kcal: number | null;
          target_protein_g: number | null;
        };
        ComputedFields: never;
        Insert: {
          athlete_id: string;
          diet_id: string;
          id?: string;
          name: string;
          position: number;
          target_carbs_g?: number | null;
          target_fats_g?: number | null;
          target_kcal?: number | null;
          target_protein_g?: number | null;
        };
        Update: {
          athlete_id?: string;
          diet_id?: string;
          id?: string;
          name?: string;
          position?: number;
          target_carbs_g?: number | null;
          target_fats_g?: number | null;
          target_kcal?: number | null;
          target_protein_g?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "meals_diet_id_athlete_id_fkey";
            columns: ["diet_id", "athlete_id"];
            isOneToOne: false;
            referencedRelation: "diet_totals";
            referencedColumns: ["diet_id", "athlete_id"];
          },
          {
            foreignKeyName: "meals_diet_id_athlete_id_fkey";
            columns: ["diet_id", "athlete_id"];
            isOneToOne: false;
            referencedRelation: "diets";
            referencedColumns: ["id", "athlete_id"];
          },
        ];
      };
      mesocycles: {
        Row: {
          athlete_id: string;
          coach_id: string;
          created_at: string;
          id: string;
          name: string;
          starts_on: string | null;
          status: string;
        };
        ComputedFields: never;
        Insert: {
          athlete_id: string;
          coach_id: string;
          created_at?: string;
          id?: string;
          name: string;
          starts_on?: string | null;
          status?: string;
        };
        Update: {
          athlete_id?: string;
          coach_id?: string;
          created_at?: string;
          id?: string;
          name?: string;
          starts_on?: string | null;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "mesocycles_athlete_id_fkey";
            columns: ["athlete_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "mesocycles_coach_id_fkey";
            columns: ["coach_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      planned_sets: {
        Row: {
          athlete_id: string;
          id: string;
          reps_max: number | null;
          reps_min: number | null;
          rir_max: number | null;
          rir_min: number | null;
          set_number: number;
          technique: string | null;
          workout_exercise_id: string;
        };
        ComputedFields: never;
        Insert: {
          athlete_id: string;
          id?: string;
          reps_max?: number | null;
          reps_min?: number | null;
          rir_max?: number | null;
          rir_min?: number | null;
          set_number: number;
          technique?: string | null;
          workout_exercise_id: string;
        };
        Update: {
          athlete_id?: string;
          id?: string;
          reps_max?: number | null;
          reps_min?: number | null;
          rir_max?: number | null;
          rir_min?: number | null;
          set_number?: number;
          technique?: string | null;
          workout_exercise_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "planned_sets_workout_exercise_id_athlete_id_fkey";
            columns: ["workout_exercise_id", "athlete_id"];
            isOneToOne: false;
            referencedRelation: "workout_exercises";
            referencedColumns: ["id", "athlete_id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          full_name: string;
          id: string;
          locale: string;
          role: Database["public"]["Enums"]["user_role"];
        };
        ComputedFields: never;
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string;
          id: string;
          locale?: string;
          role?: Database["public"]["Enums"]["user_role"];
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          full_name?: string;
          id?: string;
          locale?: string;
          role?: Database["public"]["Enums"]["user_role"];
        };
        Relationships: [];
      };
      set_logs: {
        Row: {
          athlete_id: string;
          created_at: string;
          id: string;
          reps: number | null;
          session_id: string;
          set_number: number;
          updated_at: string;
          weight_kg: number | null;
          workout_exercise_id: string;
        };
        ComputedFields: never;
        Insert: {
          athlete_id: string;
          created_at?: string;
          id?: string;
          reps?: number | null;
          session_id: string;
          set_number: number;
          updated_at?: string;
          weight_kg?: number | null;
          workout_exercise_id: string;
        };
        Update: {
          athlete_id?: string;
          created_at?: string;
          id?: string;
          reps?: number | null;
          session_id?: string;
          set_number?: number;
          updated_at?: string;
          weight_kg?: number | null;
          workout_exercise_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "set_logs_athlete_id_fkey";
            columns: ["athlete_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "set_logs_session_id_athlete_id_fkey";
            columns: ["session_id", "athlete_id"];
            isOneToOne: false;
            referencedRelation: "workout_sessions";
            referencedColumns: ["id", "athlete_id"];
          },
          {
            foreignKeyName: "set_logs_workout_exercise_id_athlete_id_fkey";
            columns: ["workout_exercise_id", "athlete_id"];
            isOneToOne: false;
            referencedRelation: "workout_exercises";
            referencedColumns: ["id", "athlete_id"];
          },
        ];
      };
      weekly_forms: {
        Row: {
          athlete_id: string;
          created_at: string;
          diet_compliance_score: number;
          diet_id: string | null;
          digestion_score: number | null;
          energy_score: number | null;
          hunger_score: number | null;
          id: string;
          notes: string | null;
          submitted_at: string;
          updated_at: string;
          week_start_date: string;
        };
        ComputedFields: never;
        Insert: {
          athlete_id: string;
          created_at?: string;
          diet_compliance_score: number;
          diet_id?: string | null;
          digestion_score?: number | null;
          energy_score?: number | null;
          hunger_score?: number | null;
          id?: string;
          notes?: string | null;
          submitted_at?: string;
          updated_at?: string;
          week_start_date: string;
        };
        Update: {
          athlete_id?: string;
          created_at?: string;
          diet_compliance_score?: number;
          diet_id?: string | null;
          digestion_score?: number | null;
          energy_score?: number | null;
          hunger_score?: number | null;
          id?: string;
          notes?: string | null;
          submitted_at?: string;
          updated_at?: string;
          week_start_date?: string;
        };
        Relationships: [
          {
            foreignKeyName: "weekly_forms_athlete_id_fkey";
            columns: ["athlete_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "weekly_forms_diet_id_athlete_id_fkey";
            columns: ["diet_id", "athlete_id"];
            isOneToOne: false;
            referencedRelation: "diet_totals";
            referencedColumns: ["diet_id", "athlete_id"];
          },
          {
            foreignKeyName: "weekly_forms_diet_id_athlete_id_fkey";
            columns: ["diet_id", "athlete_id"];
            isOneToOne: false;
            referencedRelation: "diets";
            referencedColumns: ["id", "athlete_id"];
          },
        ];
      };
      workout_exercises: {
        Row: {
          athlete_id: string;
          coach_notes: string | null;
          exercise_id: string;
          id: string;
          position: number;
          slot_label: string | null;
          workout_id: string;
        };
        ComputedFields: never;
        Insert: {
          athlete_id: string;
          coach_notes?: string | null;
          exercise_id: string;
          id?: string;
          position: number;
          slot_label?: string | null;
          workout_id: string;
        };
        Update: {
          athlete_id?: string;
          coach_notes?: string | null;
          exercise_id?: string;
          id?: string;
          position?: number;
          slot_label?: string | null;
          workout_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_exercises_exercise_id_fkey";
            columns: ["exercise_id"];
            isOneToOne: false;
            referencedRelation: "exercise_library";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workout_exercises_workout_id_athlete_id_fkey";
            columns: ["workout_id", "athlete_id"];
            isOneToOne: false;
            referencedRelation: "workouts";
            referencedColumns: ["id", "athlete_id"];
          },
        ];
      };
      workout_sessions: {
        Row: {
          athlete_id: string;
          completed_at: string | null;
          created_at: string;
          id: string;
          performed_on: string;
          workout_id: string;
        };
        ComputedFields: never;
        Insert: {
          athlete_id: string;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          performed_on?: string;
          workout_id: string;
        };
        Update: {
          athlete_id?: string;
          completed_at?: string | null;
          created_at?: string;
          id?: string;
          performed_on?: string;
          workout_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "workout_sessions_athlete_id_fkey";
            columns: ["athlete_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "workout_sessions_workout_id_athlete_id_fkey";
            columns: ["workout_id", "athlete_id"];
            isOneToOne: false;
            referencedRelation: "workouts";
            referencedColumns: ["id", "athlete_id"];
          },
        ];
      };
      workouts: {
        Row: {
          athlete_id: string;
          id: string;
          mesocycle_id: string;
          name: string;
          position: number;
        };
        ComputedFields: never;
        Insert: {
          athlete_id: string;
          id?: string;
          mesocycle_id: string;
          name: string;
          position: number;
        };
        Update: {
          athlete_id?: string;
          id?: string;
          mesocycle_id?: string;
          name?: string;
          position?: number;
        };
        Relationships: [
          {
            foreignKeyName: "workouts_mesocycle_id_athlete_id_fkey";
            columns: ["mesocycle_id", "athlete_id"];
            isOneToOne: false;
            referencedRelation: "mesocycles";
            referencedColumns: ["id", "athlete_id"];
          },
        ];
      };
    };
    Views: {
      diet_totals: {
        Row: {
          athlete_id: string;
          carbs_g: number | null;
          diet_id: string;
          fats_g: number | null;
          kcal: number | null;
          protein_g: number | null;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "diets_athlete_id_fkey";
            columns: ["athlete_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      exercise_session_volume: {
        Row: {
          athlete_id: string;
          performed_on: string;
          session_id: string;
          tonnage_kg: number | null;
          total_reps: number | null;
          workout_exercise_id: string;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "set_logs_athlete_id_fkey";
            columns: ["athlete_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "set_logs_session_id_athlete_id_fkey";
            columns: ["session_id", "athlete_id"];
            isOneToOne: false;
            referencedRelation: "workout_sessions";
            referencedColumns: ["id", "athlete_id"];
          },
          {
            foreignKeyName: "set_logs_workout_exercise_id_athlete_id_fkey";
            columns: ["workout_exercise_id", "athlete_id"];
            isOneToOne: false;
            referencedRelation: "workout_exercises";
            referencedColumns: ["id", "athlete_id"];
          },
        ];
      };
      weekly_checkin_stats: {
        Row: {
          athlete_id: string;
          avg_sleep_minutes: number | null;
          avg_steps: number | null;
          avg_stress: number | null;
          avg_weight_kg: number | null;
          days_logged: number | null;
          week_start: string | null;
        };
        ComputedFields: never;
        Relationships: [
          {
            foreignKeyName: "daily_checkins_athlete_id_fkey";
            columns: ["athlete_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: "admin" | "coach" | "athlete";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      user_role: ["admin", "coach", "athlete"],
    },
  },
} as const;
