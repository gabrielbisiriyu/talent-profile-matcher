export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      applications: {
        Row: {
          applied_at: string
          candidate_id: string
          cover_letter: string | null
          id: string
          job_id: string
          match_score: number | null
          status: string | null
        }
        Insert: {
          applied_at?: string
          candidate_id: string
          cover_letter?: string | null
          id?: string
          job_id: string
          match_score?: number | null
          status?: string | null
        }
        Update: {
          applied_at?: string
          candidate_id?: string
          cover_letter?: string | null
          id?: string
          job_id?: string
          match_score?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          address: string | null
          bio: string | null
          certifications: string[] | null
          created_at: string
          cv_embeddings: Json | null
          cv_file_name: string | null
          cv_file_type: string | null
          cv_file_url: string | null
          cv_hash: string | null
          cv_id: string | null
          education: Json | null
          email_from_cv: string | null
          experience_years: number | null
          github_url: string | null
          id: string
          linkedin_url: string | null
          parsed_cv_data: Json | null
          phone_number: string | null
          portfolio_url: string | null
          skills: string[] | null
          updated_at: string
          work_experience: Json | null
        }
        Insert: {
          address?: string | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          cv_embeddings?: Json | null
          cv_file_name?: string | null
          cv_file_type?: string | null
          cv_file_url?: string | null
          cv_hash?: string | null
          cv_id?: string | null
          education?: Json | null
          email_from_cv?: string | null
          experience_years?: number | null
          github_url?: string | null
          id: string
          linkedin_url?: string | null
          parsed_cv_data?: Json | null
          phone_number?: string | null
          portfolio_url?: string | null
          skills?: string[] | null
          updated_at?: string
          work_experience?: Json | null
        }
        Update: {
          address?: string | null
          bio?: string | null
          certifications?: string[] | null
          created_at?: string
          cv_embeddings?: Json | null
          cv_file_name?: string | null
          cv_file_type?: string | null
          cv_file_url?: string | null
          cv_hash?: string | null
          cv_id?: string | null
          education?: Json | null
          email_from_cv?: string | null
          experience_years?: number | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          parsed_cv_data?: Json | null
          phone_number?: string | null
          portfolio_url?: string | null
          skills?: string[] | null
          updated_at?: string
          work_experience?: Json | null
        }
        Relationships: []
      }
      companies: {
        Row: {
          company_description: string | null
          company_size: string | null
          created_at: string
          founded_year: number | null
          id: string
          industry: string | null
          logo_url: string | null
          updated_at: string
          website_url: string | null
        }
        Insert: {
          company_description?: string | null
          company_size?: string | null
          created_at?: string
          founded_year?: number | null
          id: string
          industry?: string | null
          logo_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          company_description?: string | null
          company_size?: string | null
          created_at?: string
          founded_year?: number | null
          id?: string
          industry?: string | null
          logo_url?: string | null
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          company_id: string
          created_at: string
          description: string
          id: string
          job_embeddings: Json | null
          job_text: string | null
          job_type: string | null
          location: string | null
          parsed_job_data: Json | null
          remote_option: boolean | null
          requirements: string[] | null
          salary_max: number | null
          salary_min: number | null
          skills_required: string[] | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description: string
          id?: string
          job_embeddings?: Json | null
          job_text?: string | null
          job_type?: string | null
          location?: string | null
          parsed_job_data?: Json | null
          remote_option?: boolean | null
          requirements?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string
          id?: string
          job_embeddings?: Json | null
          job_text?: string | null
          job_type?: string | null
          location?: string | null
          parsed_job_data?: Json | null
          remote_option?: boolean | null
          requirements?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company_name: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          location: string | null
          updated_at: string
          user_type: string
        }
        Insert: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          location?: string | null
          updated_at?: string
          user_type: string
        }
        Update: {
          company_name?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          location?: string | null
          updated_at?: string
          user_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
