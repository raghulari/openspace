-- ============================================
-- Onespace AI - Database Schema
-- Version: 1.0.0
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TABLES
-- ============================================

-- Users (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspaces (tenants)
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  industry TEXT,
  team_size TEXT,
  gst_number TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  pincode TEXT,
  phone TEXT,
  email TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace Members (user <-> workspace mapping)
CREATE TABLE IF NOT EXISTS workspace_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, workspace_id)
);

-- Get the current user's workspace IDs
CREATE OR REPLACE FUNCTION get_user_workspace_ids()
RETURNS SETOF UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid();
END;
$$;

-- Helper to check if user is a member of workspace
CREATE OR REPLACE FUNCTION is_workspace_member(ws_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = ws_id
      AND user_id = auth.uid()
  );
END;
$$;

-- Helper to check if user is admin/owner of workspace
CREATE OR REPLACE FUNCTION is_workspace_admin_or_owner(ws_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = ws_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
  );
END;
$$;

-- Helper to check if user is owner of workspace
CREATE OR REPLACE FUNCTION is_workspace_owner(ws_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workspace_members
    WHERE workspace_id = ws_id
      AND user_id = auth.uid()
      AND role = 'owner'
  );
END;
$$;

-- Customers
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  gst_number TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT DEFAULT 'India',
  pincode TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  google_drive_folder_id TEXT,
  google_drive_folder_url TEXT,
  tags JSONB DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  rate NUMERIC(12, 2) DEFAULT 0,
  unit TEXT DEFAULT 'per_project' CHECK (unit IN ('per_hour', 'per_project', 'per_month', 'per_unit')),
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
  invoice_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'pending', 'overdue')),
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal NUMERIC(12, 2) DEFAULT 0,
  tax_rate NUMERIC(5, 2) DEFAULT 18.00,
  tax_amount NUMERIC(12, 2) DEFAULT 0,
  discount NUMERIC(12, 2) DEFAULT 0,
  total NUMERIC(12, 2) DEFAULT 0,
  currency TEXT DEFAULT 'INR',
  notes TEXT,
  payment_terms TEXT,
  google_drive_file_id TEXT,
  google_drive_file_url TEXT,
  payment_method TEXT,
  paid_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, invoice_number)
);

-- Invoice Items
CREATE TABLE IF NOT EXISTS invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10, 2) DEFAULT 1,
  rate NUMERIC(12, 2) DEFAULT 0,
  amount NUMERIC(12, 2) DEFAULT 0,
  service_id UUID REFERENCES services(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('contract', 'invoice', 'report', 'meeting_note', 'proposal', 'general')),
  google_drive_file_id TEXT,
  google_drive_file_url TEXT,
  mime_type TEXT,
  size_bytes BIGINT,
  uploaded_by UUID REFERENCES auth.users(id),
  ai_summary JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Meeting Notes
CREATE TABLE IF NOT EXISTS meeting_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  content TEXT,
  google_doc_id TEXT,
  google_doc_url TEXT,
  ai_summary JSONB,
  ai_tasks JSONB DEFAULT '[]',
  ai_decisions JSONB DEFAULT '[]',
  ai_risks JSONB DEFAULT '[]',
  meeting_date DATE,
  attendees JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Calendar Events
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'meeting' CHECK (type IN ('meeting', 'renewal', 'invoice_due', 'task', 'reminder', 'follow_up')),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  google_calendar_event_id TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automations
CREATE TABLE IF NOT EXISTS automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  trigger_type TEXT,
  trigger_config JSONB DEFAULT '{}',
  condition_type TEXT,
  condition_config JSONB DEFAULT '{}',
  action_type TEXT,
  action_config JSONB DEFAULT '{}',
  n8n_workflow_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  last_run TIMESTAMPTZ,
  run_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Extractions
CREATE TABLE IF NOT EXISTS ai_extractions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  meeting_note_id UUID REFERENCES meeting_notes(id) ON DELETE CASCADE,
  extraction_type TEXT NOT NULL CHECK (extraction_type IN ('document', 'meeting')),
  extracted_data JSONB DEFAULT '{}',
  summary TEXT,
  action_items JSONB DEFAULT '[]',
  important_dates JSONB DEFAULT '[]',
  confidence_score NUMERIC(3, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Business Memories (AI knowledge base)
CREATE TABLE IF NOT EXISTS business_memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  category TEXT,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  source TEXT,
  embedding VECTOR(1536), -- For semantic search (if pgvector is enabled)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Integrations
CREATE TABLE IF NOT EXISTS integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('google_drive', 'google_calendar', 'gmail', 'google_docs', 'n8n')),
  status TEXT DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error')),
  credentials JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  connected_at TIMESTAMPTZ,
  last_synced TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, provider)
);

-- Activity Log (for activity timeline)
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  entity_type TEXT NOT NULL, -- 'customer', 'invoice', 'document', 'meeting_note', etc.
  entity_id UUID,
  action TEXT NOT NULL, -- 'created', 'updated', 'deleted', 'sent', 'paid', etc.
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

-- Workspace member lookups
CREATE INDEX idx_workspace_members_user_id ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace_id ON workspace_members(workspace_id);

-- Customer lookups
CREATE INDEX idx_customers_workspace_id ON customers(workspace_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_name ON customers(workspace_id, name);
CREATE INDEX idx_customers_status ON customers(workspace_id, status);

-- Invoice lookups
CREATE INDEX idx_invoices_workspace_id ON invoices(workspace_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(workspace_id, status);
CREATE INDEX idx_invoices_due_date ON invoices(workspace_id, due_date);
CREATE INDEX idx_invoices_number ON invoices(workspace_id, invoice_number);

-- Invoice items
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- Document lookups
CREATE INDEX idx_documents_workspace_id ON documents(workspace_id);
CREATE INDEX idx_documents_customer_id ON documents(customer_id);
CREATE INDEX idx_documents_category ON documents(workspace_id, category);

-- Meeting notes
CREATE INDEX idx_meeting_notes_workspace_id ON meeting_notes(workspace_id);
CREATE INDEX idx_meeting_notes_customer_id ON meeting_notes(customer_id);

-- Calendar events
CREATE INDEX idx_calendar_events_workspace_id ON calendar_events(workspace_id);
CREATE INDEX idx_calendar_events_start_time ON calendar_events(workspace_id, start_time);
CREATE INDEX idx_calendar_events_customer_id ON calendar_events(customer_id);

-- Automations
CREATE INDEX idx_automations_workspace_id ON automations(workspace_id);

-- AI extractions
CREATE INDEX idx_ai_extractions_workspace_id ON ai_extractions(workspace_id);
CREATE INDEX idx_ai_extractions_document_id ON ai_extractions(document_id);

-- Activity log
CREATE INDEX idx_activity_log_workspace_id ON activity_log(workspace_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(workspace_id, created_at DESC);

-- Services
CREATE INDEX idx_services_workspace_id ON services(workspace_id);

-- Integrations
CREATE INDEX idx_integrations_workspace_id ON integrations(workspace_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Users: can read/update own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- Workspaces: accessible to members
CREATE POLICY "Members can view their workspaces"
  ON workspaces FOR SELECT TO authenticated
  USING (id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Members can update their workspaces"
  ON workspaces FOR UPDATE TO authenticated
  USING (id IN (SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid() AND role IN ('owner', 'admin')));

CREATE POLICY "Authenticated users can create workspaces"
  ON workspaces FOR INSERT TO authenticated
  WITH CHECK (true);

-- Workspace Members
CREATE POLICY "Members can view workspace members"
  ON workspace_members FOR SELECT TO authenticated
  USING (is_workspace_member(workspace_id));

CREATE POLICY "Owners/admins can manage members"
  ON workspace_members FOR INSERT TO authenticated
  WITH CHECK (
    is_workspace_admin_or_owner(workspace_id)
    OR user_id = auth.uid() -- Allow users to add themselves (for workspace creation)
  );

CREATE POLICY "Owners/admins can update members"
  ON workspace_members FOR UPDATE TO authenticated
  USING (is_workspace_admin_or_owner(workspace_id));

CREATE POLICY "Owners can delete members"
  ON workspace_members FOR DELETE TO authenticated
  USING (is_workspace_owner(workspace_id));

-- Customers: workspace-scoped
CREATE POLICY "Members can view workspace customers"
  ON customers FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Members can create customers"
  ON customers FOR INSERT TO authenticated
  WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Members can update customers"
  ON customers FOR UPDATE TO authenticated
  USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Members can delete customers"
  ON customers FOR DELETE TO authenticated
  USING (workspace_id IN (SELECT get_user_workspace_ids()));

-- Services: workspace-scoped
CREATE POLICY "Members can view services"
  ON services FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Members can manage services"
  ON services FOR ALL TO authenticated
  USING (workspace_id IN (SELECT get_user_workspace_ids()));

-- Invoices: workspace-scoped
CREATE POLICY "Members can view invoices"
  ON invoices FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Members can create invoices"
  ON invoices FOR INSERT TO authenticated
  WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Members can update invoices"
  ON invoices FOR UPDATE TO authenticated
  USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Members can delete invoices"
  ON invoices FOR DELETE TO authenticated
  USING (workspace_id IN (SELECT get_user_workspace_ids()));

-- Invoice Items: accessible if parent invoice is accessible
CREATE POLICY "Members can view invoice items"
  ON invoice_items FOR SELECT TO authenticated
  USING (invoice_id IN (
    SELECT id FROM invoices WHERE workspace_id IN (SELECT get_user_workspace_ids())
  ));

CREATE POLICY "Members can manage invoice items"
  ON invoice_items FOR ALL TO authenticated
  USING (invoice_id IN (
    SELECT id FROM invoices WHERE workspace_id IN (SELECT get_user_workspace_ids())
  ));

-- Documents: workspace-scoped
CREATE POLICY "Members can view documents"
  ON documents FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Members can manage documents"
  ON documents FOR ALL TO authenticated
  USING (workspace_id IN (SELECT get_user_workspace_ids()));

-- Meeting Notes: workspace-scoped
CREATE POLICY "Members can view meeting notes"
  ON meeting_notes FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Members can manage meeting notes"
  ON meeting_notes FOR ALL TO authenticated
  USING (workspace_id IN (SELECT get_user_workspace_ids()));

-- Calendar Events: workspace-scoped
CREATE POLICY "Members can view calendar events"
  ON calendar_events FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Members can manage calendar events"
  ON calendar_events FOR ALL TO authenticated
  USING (workspace_id IN (SELECT get_user_workspace_ids()));

-- Automations: workspace-scoped
CREATE POLICY "Members can view automations"
  ON automations FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Members can manage automations"
  ON automations FOR ALL TO authenticated
  USING (workspace_id IN (SELECT get_user_workspace_ids()));

-- AI Extractions: workspace-scoped
CREATE POLICY "Members can view extractions"
  ON ai_extractions FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Members can manage extractions"
  ON ai_extractions FOR ALL TO authenticated
  USING (workspace_id IN (SELECT get_user_workspace_ids()));

-- Business Memories: workspace-scoped
CREATE POLICY "Members can view business memories"
  ON business_memories FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Members can manage business memories"
  ON business_memories FOR ALL TO authenticated
  USING (workspace_id IN (SELECT get_user_workspace_ids()));

-- Integrations: workspace-scoped
CREATE POLICY "Members can view integrations"
  ON integrations FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Owners/admins can manage integrations"
  ON integrations FOR ALL TO authenticated
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Activity Log: workspace-scoped
CREATE POLICY "Members can view activity log"
  ON activity_log FOR SELECT TO authenticated
  USING (workspace_id IN (SELECT get_user_workspace_ids()));

CREATE POLICY "Members can create activity log"
  ON activity_log FOR INSERT TO authenticated
  WITH CHECK (workspace_id IN (SELECT get_user_workspace_ids()));

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_workspaces_updated_at BEFORE UPDATE ON workspaces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_meeting_notes_updated_at BEFORE UPDATE ON meeting_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON automations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- AUTO-CREATE USER PROFILE ON SIGNUP
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- INVOICE NUMBER SEQUENCE
-- ============================================

CREATE OR REPLACE FUNCTION generate_invoice_number(ws_id UUID)
RETURNS TEXT AS $$
DECLARE
  next_num INTEGER;
  prefix TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO next_num
  FROM invoices
  WHERE workspace_id = ws_id;
  
  prefix := 'INV';
  RETURN prefix || '-' || LPAD(next_num::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;
