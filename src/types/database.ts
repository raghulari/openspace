// ============================================
// Onespace AI - Database Types
// ============================================

export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Workspace {
  id: string
  name: string
  slug: string
  industry: string | null
  team_size: string | null
  gst_number: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  state: string | null
  country: string
  pincode: string | null
  phone: string | null
  email: string | null
  logo_url: string | null
  settings: Record<string, unknown>
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export type WorkspaceMemberRole = 'owner' | 'admin' | 'member'

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: WorkspaceMemberRole
  created_at: string
}

export type CustomerStatus = 'active' | 'inactive'

export interface Customer {
  id: string
  workspace_id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  gst_number: string | null
  address: string | null
  city: string | null
  state: string | null
  country: string
  pincode: string | null
  status: CustomerStatus
  google_drive_folder_id: string | null
  google_drive_folder_url: string | null
  tags: string[]
  notes: string | null
  created_at: string
  updated_at: string
}

export type ServiceUnit = 'per_hour' | 'per_project' | 'per_month' | 'per_unit'

export interface Service {
  id: string
  workspace_id: string
  name: string
  description: string | null
  rate: number
  unit: ServiceUnit
  category: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'pending' | 'overdue'

export interface Invoice {
  id: string
  workspace_id: string
  customer_id: string
  invoice_number: string
  status: InvoiceStatus
  invoice_date: string
  due_date: string | null
  subtotal: number
  tax_rate: number
  tax_amount: number
  discount: number
  total: number
  currency: string
  notes: string | null
  payment_terms: string | null
  google_drive_file_id: string | null
  google_drive_file_url: string | null
  payment_method: string | null
  paid_date: string | null
  created_at: string
  updated_at: string
  // Joined fields
  customer?: Customer
  items?: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  rate: number
  amount: number
  service_id: string | null
  sort_order: number
  created_at: string
}

export type DocumentCategory =
  | 'contract'
  | 'invoice'
  | 'report'
  | 'meeting_note'
  | 'proposal'
  | 'general'

export interface Document {
  id: string
  workspace_id: string
  customer_id: string | null
  name: string
  category: DocumentCategory
  google_drive_file_id: string | null
  google_drive_file_url: string | null
  mime_type: string | null
  size_bytes: number | null
  uploaded_by: string | null
  ai_summary: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface MeetingNote {
  id: string
  workspace_id: string
  customer_id: string | null
  title: string
  content: string | null
  google_doc_id: string | null
  google_doc_url: string | null
  ai_summary: Record<string, unknown> | null
  ai_tasks: Array<Record<string, unknown>>
  ai_decisions: Array<Record<string, unknown>>
  ai_risks: Array<Record<string, unknown>>
  meeting_date: string | null
  attendees: Array<Record<string, unknown>>
  created_at: string
  updated_at: string
}

export type CalendarEventType =
  | 'meeting'
  | 'renewal'
  | 'invoice_due'
  | 'task'
  | 'reminder'
  | 'follow_up'

export type CalendarEventStatus = 'scheduled' | 'completed' | 'cancelled'

export interface CalendarEvent {
  id: string
  workspace_id: string
  customer_id: string | null
  title: string
  description: string | null
  type: CalendarEventType
  start_time: string
  end_time: string | null
  google_calendar_event_id: string | null
  status: CalendarEventStatus
  created_by: string | null
  created_at: string
  updated_at: string
}

export type AutomationStatus = 'active' | 'paused' | 'error'

export interface Automation {
  id: string
  workspace_id: string
  name: string
  description: string | null
  trigger_type: string | null
  trigger_config: Record<string, unknown>
  condition_type: string | null
  condition_config: Record<string, unknown>
  action_type: string | null
  action_config: Record<string, unknown>
  n8n_workflow_id: string | null
  status: AutomationStatus
  last_run: string | null
  run_count: number
  created_at: string
  updated_at: string
}

export type ExtractionType = 'document' | 'meeting'

export interface AIExtraction {
  id: string
  workspace_id: string
  document_id: string | null
  meeting_note_id: string | null
  extraction_type: ExtractionType
  extracted_data: Record<string, unknown>
  summary: string | null
  action_items: Array<Record<string, unknown>>
  important_dates: Array<Record<string, unknown>>
  confidence_score: number | null
  created_at: string
}

export interface BusinessMemory {
  id: string
  workspace_id: string
  category: string | null
  content: string
  metadata: Record<string, unknown>
  source: string | null
  created_at: string
}

export type IntegrationProvider =
  | 'google_drive'
  | 'google_calendar'
  | 'gmail'
  | 'google_docs'
  | 'n8n'

export type IntegrationStatus = 'connected' | 'disconnected' | 'error'

export interface Integration {
  id: string
  workspace_id: string
  provider: IntegrationProvider
  status: IntegrationStatus
  credentials: Record<string, unknown>
  settings: Record<string, unknown>
  connected_at: string | null
  last_synced: string | null
  created_at: string
}

export interface ActivityLog {
  id: string
  workspace_id: string
  user_id: string | null
  entity_type: string
  entity_id: string | null
  action: string
  description: string | null
  metadata: Record<string, unknown>
  created_at: string
}
