export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      cash_flow: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          date: string
          description: string | null
          id: number
          type: Database["public"]["Enums"]["cash_flow_type"]
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          id?: number
          type: Database["public"]["Enums"]["cash_flow_type"]
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          id?: number
          type?: Database["public"]["Enums"]["cash_flow_type"]
          updated_at?: string
        }
        Relationships: []
      }
      checkin_logs: {
        Row: {
          checkin_type: Database["public"]["Enums"]["checkin_type"]
          created_at: string
          employee_id: number
          id: string
          latitude: number | null
          location_name: string | null
          longitude: number | null
          notes: string | null
          photo_url: string | null
          qr_code_data: string | null
          service_item_id: string | null
        }
        Insert: {
          checkin_type: Database["public"]["Enums"]["checkin_type"]
          created_at?: string
          employee_id: number
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          notes?: string | null
          photo_url?: string | null
          qr_code_data?: string | null
          service_item_id?: string | null
        }
        Update: {
          checkin_type?: Database["public"]["Enums"]["checkin_type"]
          created_at?: string
          employee_id?: number
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          notes?: string | null
          photo_url?: string | null
          qr_code_data?: string | null
          service_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkin_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkin_logs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkin_logs_service_item_id_fkey"
            columns: ["service_item_id"]
            isOneToOne: false
            referencedRelation: "service_items"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          category: Database["public"]["Enums"]["customer_category"]
          created_at: string
          email: string | null
          id: string
          member_number: string | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          category?: Database["public"]["Enums"]["customer_category"]
          created_at?: string
          email?: string | null
          id?: string
          member_number?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          category?: Database["public"]["Enums"]["customer_category"]
          created_at?: string
          email?: string | null
          id?: string
          member_number?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          address: string | null
          created_at: string
          current_workload: number | null
          email: string | null
          id: number
          is_available: boolean | null
          is_queue_locked: boolean | null
          max_workload: number | null
          name: string
          phone: string | null
          queue_lock_reason: string | null
          status: Database["public"]["Enums"]["employee_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          current_workload?: number | null
          email?: string | null
          id?: number
          is_available?: boolean | null
          is_queue_locked?: boolean | null
          max_workload?: number | null
          name: string
          phone?: string | null
          queue_lock_reason?: string | null
          status?: Database["public"]["Enums"]["employee_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          current_workload?: number | null
          email?: string | null
          id?: number
          is_available?: boolean | null
          is_queue_locked?: boolean | null
          max_workload?: number | null
          name?: string
          phone?: string | null
          queue_lock_reason?: string | null
          status?: Database["public"]["Enums"]["employee_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          customer_name: string | null
          date: string
          id: number
          method: string | null
          notes: string | null
          reference_id: string
          reference_type: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          customer_name?: string | null
          date?: string
          id?: number
          method?: string | null
          notes?: string | null
          reference_id: string
          reference_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          customer_name?: string | null
          date?: string
          id?: number
          method?: string | null
          notes?: string | null
          reference_id?: string
          reference_type?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: number | null
          cost_price: number
          created_at: string
          description: string | null
          id: number
          is_active: boolean | null
          min_stock: number | null
          name: string
          photo_url: string | null
          sell_price: number
          serial_number: string | null
          stock: number
          unit: string | null
          updated_at: string
        }
        Insert: {
          category_id?: number | null
          cost_price?: number
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean | null
          min_stock?: number | null
          name: string
          photo_url?: string | null
          sell_price?: number
          serial_number?: string | null
          stock?: number
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category_id?: number | null
          cost_price?: number
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean | null
          min_stock?: number | null
          name?: string
          photo_url?: string | null
          sell_price?: number
          serial_number?: string | null
          stock?: number
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          cost_price: number
          created_at: string
          id: number
          product_id: number | null
          product_name: string
          quantity: number
          sell_price: number
          subtotal: number
          transaction_detail_id: string | null
          transaction_id: string
        }
        Insert: {
          cost_price?: number
          created_at?: string
          id?: number
          product_id?: number | null
          product_name: string
          quantity?: number
          sell_price?: number
          subtotal?: number
          transaction_detail_id?: string | null
          transaction_id: string
        }
        Update: {
          cost_price?: number
          created_at?: string
          id?: number
          product_id?: number | null
          product_name?: string
          quantity?: number
          sell_price?: number
          subtotal?: number
          transaction_detail_id?: string | null
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_transaction_detail_id_fkey"
            columns: ["transaction_detail_id"]
            isOneToOne: false
            referencedRelation: "transaction_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      service_assignments: {
        Row: {
          approved_by: string | null
          assigned_by: string | null
          assignment_reason: string | null
          created_at: string
          id: string
          rejection_reason: string | null
          service_item_id: string
          status: Database["public"]["Enums"]["assignment_status"]
          technician_id: number
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          assigned_by?: string | null
          assignment_reason?: string | null
          created_at?: string
          id?: string
          rejection_reason?: string | null
          service_item_id: string
          status?: Database["public"]["Enums"]["assignment_status"]
          technician_id: number
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          assigned_by?: string | null
          assignment_reason?: string | null
          created_at?: string
          id?: string
          rejection_reason?: string | null
          service_item_id?: string
          status?: Database["public"]["Enums"]["assignment_status"]
          technician_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_assignments_service_item_id_fkey"
            columns: ["service_item_id"]
            isOneToOne: false
            referencedRelation: "service_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_assignments_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_assignments_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "employees_public"
            referencedColumns: ["id"]
          },
        ]
      }
      service_items: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          device_name: string
          device_serial_number: string | null
          diagnosis: string | null
          id: string
          is_sla_breached: boolean | null
          labor_cost: number | null
          qr_code: string | null
          service_order_id: string
          sla_category: string | null
          sla_deadline: string | null
          status: Database["public"]["Enums"]["service_status"]
          technician_id: number | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          device_name: string
          device_serial_number?: string | null
          diagnosis?: string | null
          id?: string
          is_sla_breached?: boolean | null
          labor_cost?: number | null
          qr_code?: string | null
          service_order_id: string
          sla_category?: string | null
          sla_deadline?: string | null
          status?: Database["public"]["Enums"]["service_status"]
          technician_id?: number | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          device_name?: string
          device_serial_number?: string | null
          diagnosis?: string | null
          id?: string
          is_sla_breached?: boolean | null
          labor_cost?: number | null
          qr_code?: string | null
          service_order_id?: string
          sla_category?: string | null
          sla_deadline?: string | null
          status?: Database["public"]["Enums"]["service_status"]
          technician_id?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_items_service_order_id_fkey"
            columns: ["service_order_id"]
            isOneToOne: false
            referencedRelation: "service_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_items_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_items_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "employees_public"
            referencedColumns: ["id"]
          },
        ]
      }
      service_orders: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string | null
          date: string
          description: string | null
          id: string
          status: Database["public"]["Enums"]["service_status"]
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          date?: string
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["service_status"]
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          date?: string
          description?: string | null
          id?: string
          status?: Database["public"]["Enums"]["service_status"]
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_orders_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      service_parts: {
        Row: {
          created_at: string
          id: number
          price: number
          product_id: number | null
          product_name: string
          quantity: number
          service_item_id: string
          subtotal: number
        }
        Insert: {
          created_at?: string
          id?: number
          price?: number
          product_id?: number | null
          product_name: string
          quantity?: number
          service_item_id: string
          subtotal?: number
        }
        Update: {
          created_at?: string
          id?: number
          price?: number
          product_id?: number | null
          product_name?: string
          quantity?: number
          service_item_id?: string
          subtotal?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_parts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_parts_service_item_id_fkey"
            columns: ["service_item_id"]
            isOneToOne: false
            referencedRelation: "service_items"
            referencedColumns: ["id"]
          },
        ]
      }
      service_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          photo_type: string
          photo_url: string
          service_item_id: string
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          photo_type: string
          photo_url: string
          service_item_id: string
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          photo_type?: string
          photo_url?: string
          service_item_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_photos_service_item_id_fkey"
            columns: ["service_item_id"]
            isOneToOne: false
            referencedRelation: "service_items"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_configs: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: number
          is_active: boolean | null
          priority_level: number | null
          target_hours: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean | null
          priority_level?: number | null
          target_hours: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean | null
          priority_level?: number | null
          target_hours?: number
          updated_at?: string
        }
        Relationships: []
      }
      technician_skills: {
        Row: {
          created_at: string
          employee_id: number
          id: number
          proficiency_level: number | null
          skill_name: string
        }
        Insert: {
          created_at?: string
          employee_id: number
          id?: number
          proficiency_level?: number | null
          skill_name: string
        }
        Update: {
          created_at?: string
          employee_id?: number
          id?: number
          proficiency_level?: number | null
          skill_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "technician_skills_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "technician_skills_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_public"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_details: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location_name: string
          subtotal: number
          transaction_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location_name: string
          subtotal?: number
          transaction_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location_name?: string
          subtotal?: number
          transaction_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_details_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          created_at: string
          created_by: string | null
          customer_id: string | null
          date: string
          id: string
          is_tempo: boolean | null
          location: string | null
          notes: string | null
          paid_amount: number
          payment_status: Database["public"]["Enums"]["payment_status"]
          project_name: string | null
          reference: string | null
          tempo_due_date: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          date?: string
          id?: string
          is_tempo?: boolean | null
          location?: string | null
          notes?: string | null
          paid_amount?: number
          payment_status?: Database["public"]["Enums"]["payment_status"]
          project_name?: string | null
          reference?: string | null
          tempo_due_date?: string | null
          total_amount?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          date?: string
          id?: string
          is_tempo?: boolean | null
          location?: string | null
          notes?: string | null
          paid_amount?: number
          payment_status?: Database["public"]["Enums"]["payment_status"]
          project_name?: string | null
          reference?: string | null
          tempo_due_date?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      warranties: {
        Row: {
          created_at: string
          customer_id: string
          device_name: string
          id: string
          is_active: boolean | null
          product_id: number | null
          serial_number: string | null
          service_item_id: string | null
          terms: string | null
          updated_at: string
          warranty_end: string
          warranty_start: string
          warranty_type: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          device_name: string
          id?: string
          is_active?: boolean | null
          product_id?: number | null
          serial_number?: string | null
          service_item_id?: string | null
          terms?: string | null
          updated_at?: string
          warranty_end: string
          warranty_start: string
          warranty_type?: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          device_name?: string
          id?: string
          is_active?: boolean | null
          product_id?: number | null
          serial_number?: string | null
          service_item_id?: string | null
          terms?: string | null
          updated_at?: string
          warranty_end?: string
          warranty_start?: string
          warranty_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "warranties_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranties_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warranties_service_item_id_fkey"
            columns: ["service_item_id"]
            isOneToOne: false
            referencedRelation: "service_items"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      employees_public: {
        Row: {
          created_at: string | null
          current_workload: number | null
          id: number | null
          is_available: boolean | null
          is_queue_locked: boolean | null
          max_workload: number | null
          name: string | null
          status: Database["public"]["Enums"]["employee_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_workload?: number | null
          id?: number | null
          is_available?: boolean | null
          is_queue_locked?: boolean | null
          max_workload?: number | null
          name?: string | null
          status?: Database["public"]["Enums"]["employee_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_workload?: number | null
          id?: number | null
          is_available?: boolean | null
          is_queue_locked?: boolean | null
          max_workload?: number | null
          name?: string | null
          status?: Database["public"]["Enums"]["employee_status"] | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_employee_id_for_user: { Args: { _user_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "cashier" | "technician" | "manager"
      assignment_status:
        | "pending_approval"
        | "approved"
        | "rejected"
        | "reassigned"
        | "in_progress"
        | "completed"
      cash_flow_type: "income" | "expense"
      checkin_type: "start_work" | "end_work" | "office_return"
      customer_category: "retail" | "project" | "institution"
      employee_status: "active" | "inactive" | "working"
      payment_status: "unpaid" | "partial" | "paid"
      service_status: "pending" | "in_progress" | "completed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "cashier", "technician", "manager"],
      assignment_status: [
        "pending_approval",
        "approved",
        "rejected",
        "reassigned",
        "in_progress",
        "completed",
      ],
      cash_flow_type: ["income", "expense"],
      checkin_type: ["start_work", "end_work", "office_return"],
      customer_category: ["retail", "project", "institution"],
      employee_status: ["active", "inactive", "working"],
      payment_status: ["unpaid", "partial", "paid"],
      service_status: ["pending", "in_progress", "completed", "cancelled"],
    },
  },
} as const
