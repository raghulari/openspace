import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CustomerProfile } from '@/features/customers/components/customer-profile'

interface CustomerProfilePageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: CustomerProfilePageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: customer } = await supabase
    .from('customers')
    .select('name, company')
    .eq('id', id)
    .single()

  return {
    title: customer
      ? `${customer.name} (${customer.company || 'Client'}) - Onespace AI`
      : 'Customer Profile - Onespace AI',
  }
}

export default async function CustomerProfilePage({ params }: CustomerProfilePageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get current user session
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Fetch customer details
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (customerError || !customer) {
    redirect('/customers')
  }

  // Parallel fetch client billing details and operations history
  const [
    { data: invoices },
    { data: documents },
    { data: meetings },
    { data: activities },
  ] = await Promise.all([
    supabase
      .from('invoices')
      .select('*')
      .eq('customer_id', id)
      .order('invoice_date', { ascending: false }),
    supabase
      .from('documents')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('meeting_notes')
      .select('*')
      .eq('customer_id', id)
      .order('meeting_date', { ascending: false }),
    supabase
      .from('activity_log')
      .select('*')
      .eq('entity_id', id)
      .order('created_at', { ascending: false }),
  ])

  return (
    <CustomerProfile
      customer={customer}
      invoices={invoices || []}
      documents={documents || []}
      meetings={meetings || []}
      activities={activities || []}
    />
  )
}
