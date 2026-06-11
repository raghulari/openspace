'use server'

import { createClient } from '@/lib/supabase/server'
import { createFolder } from '@/lib/google/drive'
import { revalidatePath } from 'next/cache'

export interface CustomerData {
  name: string
  email: string
  phone: string
  company: string
  gstNumber?: string
  address?: string
  city?: string
  state?: string
  country?: string
  pincode?: string
  status: 'active' | 'inactive'
  tags?: string[]
  notes?: string
}

/**
 * Log activity helper
 */
async function logActivity(
  supabase: any,
  workspaceId: string,
  userId: string | undefined,
  entityType: string,
  entityId: string,
  action: string,
  description: string,
  metadata: any = {}
) {
  try {
    await supabase.from('activity_log').insert({
      workspace_id: workspaceId,
      user_id: userId || null,
      entity_type: entityType,
      entity_id: entityId,
      action,
      description,
      metadata,
    })
  } catch (err) {
    console.error('Failed to log activity:', err)
  }
}

/**
 * Helper to auto-create Google Drive folder structure for a customer.
 * If integration is disconnected, it generates mock paths.
 */
async function setupCustomerDriveFolder(
  supabase: any,
  workspaceId: string,
  customerName: string
): Promise<{ folderId: string; folderUrl: string }> {
  try {
    // 1. Check if Google Drive integration is connected
    const { data: integration } = await supabase
      .from('integrations')
      .select('status, credentials')
      .eq('workspace_id', workspaceId)
      .eq('provider', 'google_drive')
      .single()

    if (integration && integration.status === 'connected' && integration.credentials?.access_token) {
      const accessToken = integration.credentials.access_token

      // Find or create a root BusinessOS app folder in user's drive (or just create parent folder for customer)
      // For simplicity, we create the Customer Parent folder directly in Drive root
      const parentFolder = await createFolder(accessToken, { name: customerName })
      const parentId = parentFolder.id

      // Create subfolders: Contracts, Invoices, Documents, Meeting Notes, Reports
      const subfolders = ['Contracts', 'Invoices', 'Documents', 'Meeting Notes', 'Reports']
      for (const folderName of subfolders) {
        await createFolder(accessToken, { name: folderName, parentId })
      }

      return {
        folderId: parentId,
        folderUrl: parentFolder.webViewLink || `https://drive.google.com/drive/folders/${parentId}`,
      }
    }
  } catch (err) {
    console.error('Google Drive folder creation failed, falling back to mock paths:', err)
  }

  // Fallback to mock path if disconnected or failed
  const mockId = `mock-folder-${Math.random().toString(36).substr(2, 9)}`
  return {
    folderId: mockId,
    folderUrl: `https://drive.google.com/drive/folders/${mockId}`,
  }
}

/**
 * Create a new customer
 */
export async function createCustomer(workspaceId: string, data: CustomerData) {
  const supabase = await createClient()

  // Get current user for logging
  const {
    data: { user },
  } = await supabase.auth.getUser()

  try {
    // 1. Insert customer metadata (without drive folder details first)
    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert({
        workspace_id: workspaceId,
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        gst_number: data.gstNumber || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        country: data.country || 'India',
        pincode: data.pincode || null,
        status: data.status,
        tags: data.tags || [],
        notes: data.notes || null,
      })
      .select()
      .single()

    if (error) throw error

    // 2. Build Drive folder structure (async simulation or live connection)
    const driveFolder = await setupCustomerDriveFolder(supabase, workspaceId, data.name)

    // 3. Update customer with Drive folder details
    const { data: updatedCustomer, error: updateError } = await supabase
      .from('customers')
      .update({
        google_drive_folder_id: driveFolder.folderId,
        google_drive_folder_url: driveFolder.folderUrl,
      })
      .eq('id', newCustomer.id)
      .select()
      .single()

    if (updateError) throw updateError

    // 4. Log to activity logs
    await logActivity(
      supabase,
      workspaceId,
      user?.id,
      'customer',
      updatedCustomer.id,
      'created',
      `Customer "${data.name}" was created by ${user?.user_metadata?.full_name || 'System'}`,
      { customer_name: data.name, company: data.company }
    )

    revalidatePath('/customers')
    return { success: true, customer: updatedCustomer }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to create customer' }
  }
}

/**
 * Update an existing customer
 */
export async function updateCustomer(
  workspaceId: string,
  customerId: string,
  data: Partial<CustomerData>
) {
  const supabase = await createClient()

  // Get current user for logging
  const {
    data: { user },
  } = await supabase.auth.getUser()

  try {
    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    }

    if (data.name !== undefined) updatePayload.name = data.name
    if (data.email !== undefined) updatePayload.email = data.email
    if (data.phone !== undefined) updatePayload.phone = data.phone
    if (data.company !== undefined) updatePayload.company = data.company
    if (data.gstNumber !== undefined) updatePayload.gst_number = data.gstNumber || null
    if (data.address !== undefined) updatePayload.address = data.address || null
    if (data.city !== undefined) updatePayload.city = data.city || null
    if (data.state !== undefined) updatePayload.state = data.state || null
    if (data.country !== undefined) updatePayload.country = data.country || 'India'
    if (data.pincode !== undefined) updatePayload.pincode = data.pincode || null
    if (data.status !== undefined) updatePayload.status = data.status
    if (data.tags !== undefined) updatePayload.tags = data.tags
    if (data.notes !== undefined) updatePayload.notes = data.notes || null

    const { data: updatedCustomer, error } = await supabase
      .from('customers')
      .update(updatePayload)
      .eq('id', customerId)
      .select()
      .single()

    if (error) throw error

    // Log to activity logs
    await logActivity(
      supabase,
      workspaceId,
      user?.id,
      'customer',
      customerId,
      'updated',
      `Customer "${updatedCustomer.name}" details updated`,
      { updated_fields: Object.keys(data) }
    )

    revalidatePath('/customers')
    revalidatePath(`/customers/${customerId}`)
    return { success: true, customer: updatedCustomer }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to update customer' }
  }
}

/**
 * Delete a customer
 */
export async function deleteCustomer(workspaceId: string, customerId: string, customerName: string) {
  const supabase = await createClient()

  // Get current user for logging
  const {
    data: { user },
  } = await supabase.auth.getUser()

  try {
    const { error } = await supabase.from('customers').delete().eq('id', customerId)

    if (error) throw error

    // Log to activity logs
    await logActivity(
      supabase,
      workspaceId,
      user?.id,
      'customer',
      customerId,
      'deleted',
      `Customer "${customerName}" was deleted`,
      { customer_name: customerName }
    )

    revalidatePath('/customers')
    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to delete customer' }
  }
}
