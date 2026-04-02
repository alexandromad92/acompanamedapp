// Tipos generados manualmente — reemplazar con `supabase gen types` después

export type UserRole = 'medico' | 'paciente'
export type ProtocolTipoDb = 'GLP-1' | 'TRT' | 'Hormonal Femenino' | 'Suplementación'
export type LabStatusDb = 'Revisado por médico' | 'Pendiente de revisión'
export type MessageSenderDb = 'medico' | 'paciente'
export type SubscriptionStatus = 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: UserRole
          nombre: string
          apellido: string | null
          email: string
          avatar_initials: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      patients: {
        Row: {
          id: string
          edad: number | null
          pais: string | null
          peso_actual: number | null
          altura: number | null
          imc: number | null
          medicamentos_actuales: string | null
          supervision_actual: string | null
          frustracion_principal: string | null
          sintomas: string[]
          energia: number | null
          sueno: number | null
          libido: number | null
          intentos_anteriores: string | null
          por_que_fallaron: string | null
          condiciones_medicas: string | null
          objetivo_principal: string | null
          objetivos_3_meses: string | null
          resultado_ideal: string | null
          fecha_registro: string
        }
        Insert: Partial<Database['public']['Tables']['patients']['Row']> & { id: string }
        Update: Partial<Database['public']['Tables']['patients']['Row']>
      }
      protocols: {
        Row: {
          id: string
          patient_id: string
          titulo: string
          tipo: ProtocolTipoDb
          resumen_caso: string | null
          diagnostico: string | null
          plan_medicacion: string | null
          plan_nutricion: string | null
          plan_suplementacion: string[]
          plan_ejercicio: string | null
          plan_seguimiento: string | null
          que_esperar: string | null
          que_evitar: string | null
          senales_alerta: string | null
          proxima_revision: string | null
          version: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['protocols']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['protocols']['Insert']>
      }
      messages: {
        Row: {
          id: string
          patient_id: string
          sender: MessageSenderDb
          texto: string
          created_at: string
          read_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at' | 'read_at'>
        Update: Partial<Database['public']['Tables']['messages']['Insert']>
      }
      lab_files: {
        Row: {
          id: string
          patient_id: string
          nombre: string
          storage_path: string
          tipo: string | null
          estado: LabStatusDb
          created_at: string
          reviewed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['lab_files']['Row'], 'id' | 'created_at' | 'reviewed_at'>
        Update: Partial<Database['public']['Tables']['lab_files']['Insert']>
      }
      progress_entries: {
        Row: {
          id: string
          patient_id: string
          fecha: string
          mes: string
          peso: number
          energia: number
          sueno: number
          libido: number
          notas: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['progress_entries']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['progress_entries']['Insert']>
      }
      subscriptions: {
        Row: {
          id: string
          patient_id: string
          mp_preapproval_id: string | null
          mp_payer_email: string | null
          status: SubscriptionStatus
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
      }
    }
  }
}
