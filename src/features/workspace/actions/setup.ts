'use server'

import { createClient } from '@/lib/supabase/server'
import { generateText } from '@/lib/ai/gemini'
import { redirect } from 'next/navigation'
import crypto from 'crypto'

export interface CompanyInfoData {
  workspaceId?: string
  name: string
  slug: string
  industry: string
  teamSize: string
  gstNumber?: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  pincode: string
  phone: string
  email: string
}

export interface SuggestedService {
  name: string
  rate: number
  unit: 'per_hour' | 'per_project' | 'per_month' | 'per_unit'
  category: string
  description: string
}

/**
 * Step 1: Save Company Info & Create/Update Workspace
 */
export async function saveCompanyInfo(data: CompanyInfoData) {
  const supabase = await createClient()

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, message: 'Authentication required' }
  }

  const workspaceSlug = data.slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-')

  try {
    if (data.workspaceId) {
      const workspaceData = {
        name: data.name,
        slug: workspaceSlug,
        industry: data.industry,
        team_size: data.teamSize,
        gst_number: data.gstNumber || null,
        address_line1: data.addressLine1,
        address_line2: data.addressLine2 || null,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        phone: data.phone,
        email: data.email,
      }

      // Update existing workspace
      const { error: updateError } = await supabase
        .from('workspaces')
        .update(workspaceData)
        .eq('id', data.workspaceId)

      if (updateError) throw updateError

      return { success: true, workspaceId: data.workspaceId }
    } else {
      // Check if slug is already taken
      const { data: existingWorkspace } = await supabase
        .from('workspaces')
        .select('id')
        .eq('slug', workspaceSlug)
        .maybeSingle()

      if (existingWorkspace) {
        return { success: false, message: 'Workspace URL slug is already taken. Please choose a different one.' }
      }

      // Pre-generate the workspace ID so we can insert workspace_members without returning the workspace first
      const newWorkspaceId = crypto.randomUUID()
      const workspaceData = {
        id: newWorkspaceId,
        name: data.name,
        slug: workspaceSlug,
        industry: data.industry,
        team_size: data.teamSize,
        gst_number: data.gstNumber || null,
        address_line1: data.addressLine1,
        address_line2: data.addressLine2 || null,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        phone: data.phone,
        email: data.email,
      }

      // Create new workspace (no .select().single() to bypass RLS SELECT policies)
      const { error: insertError } = await supabase
        .from('workspaces')
        .insert(workspaceData)

      if (insertError) throw insertError

      // Add user as owner in workspace_members
      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: newWorkspaceId,
          user_id: user.id,
          role: 'owner',
        })

      if (memberError) throw memberError

      return { success: true, workspaceId: newWorkspaceId }
    }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to save company information' }
  }
}

/**
 * Step 3: Call Gemini to suggest categories, services, and default rates
 */
export async function getAISuggestions(businessDescription: string): Promise<{
  success: boolean
  message?: string
  suggestions?: SuggestedService[]
}> {
  if (!businessDescription || businessDescription.trim().length < 10) {
    return { success: false, message: 'Please write a description at least 10 characters long.' }
  }

  const prompt = `You are an AI business onboarding advisor. Based on this description of a business:
"${businessDescription}"

Suggest 4 standard professional services that this business typically bills their customers for.
For each service, provide:
1. "name": Service name (e.g. Website Design, SEO Monthly retainer, Content Strategy, Legal Advisory)
2. "rate": Typical starting billing rate in INR (Rs.) as a number (e.g., 25000, 5000, 1500, etc.)
3. "unit": Either "per_hour", "per_project", or "per_month"
4. "category": Broad category name (e.g. Design, Marketing, Consulting, Support)
5. "description": A short 1-sentence billing description for client invoices.

Return the response ONLY as a valid JSON array of objects, with keys: "name", "rate", "unit", "category", "description". Return no additional conversational text or markdown formatting (like \`\`\`json). Just the raw JSON.`

  try {
    let suggestions: SuggestedService[] = []

    if (process.env.GEMINI_API_KEY) {
      const response = await generateText(prompt, { temperature: 0.5 })
      let text = response.text.trim()
      
      // Clean up markdown markers if present
      if (text.startsWith('```')) {
        text = text.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim()
      }

      try {
        suggestions = JSON.parse(text)
      } catch (parseErr) {
        console.error('Failed to parse Gemini suggestions JSON. Raw response:', text)
        throw new Error('Invalid JSON format returned from AI')
      }
    } else {
      // Fallback if Gemini key is missing
      const descLower = businessDescription.toLowerCase()
      if (descLower.includes('software') || descLower.includes('tech') || descLower.includes('web') || descLower.includes('app') || descLower.includes('code')) {
        suggestions = [
          { name: 'Custom Web Application Development', rate: 120000, unit: 'per_project', category: 'Development', description: 'Design and development of custom React/Next.js responsive web application.' },
          { name: 'Mobile App Development', rate: 250000, unit: 'per_project', category: 'Development', description: 'Cross-platform iOS and Android mobile app development.' },
          { name: 'Technical Consulting & Architecture', rate: 2500, unit: 'per_hour', category: 'Consulting', description: 'System architecture review and cloud infrastructure consultancy.' },
          { name: 'App Maintenance & Support Retainer', rate: 25000, unit: 'per_month', category: 'Support', description: 'Monthly dedicated bug fixing, updates, and server maintenance support.' }
        ]
      } else if (descLower.includes('marketing') || descLower.includes('seo') || descLower.includes('social') || descLower.includes('ad') || descLower.includes('brand')) {
        suggestions = [
          { name: 'Search Engine Optimization (SEO)', rate: 15000, unit: 'per_month', category: 'Marketing', description: 'Monthly on-page, technical SEO updates and backlink building campaigns.' },
          { name: 'Social Media Management (SMM)', rate: 20000, unit: 'per_month', category: 'Marketing', description: 'Management and creation of content for Instagram, LinkedIn and Facebook.' },
          { name: 'Brand Identity Design Package', rate: 45000, unit: 'per_project', category: 'Design', description: 'Creation of logo, typography, color palette, and full brand guideline book.' },
          { name: 'PPC Ad Campaign Management', rate: 10000, unit: 'per_month', category: 'Marketing', description: 'Google and Meta ad setups, optimization, and monthly report tracking.' }
        ]
      } else {
        // General professional services fallback
        suggestions = [
          { name: 'Business Advisory & Consulting', rate: 3000, unit: 'per_hour', category: 'Consulting', description: 'General business strategy planning and operational optimization advising.' },
          { name: 'Project Implementation Phase', rate: 75000, unit: 'per_project', category: 'Operations', description: 'Operational rollout of business automation tools and team training.' },
          { name: 'Monthly Operations Support Retainer', rate: 30000, unit: 'per_month', category: 'Support', description: 'Dedicated monthly support and operations assistance hours.' },
          { name: 'Strategic Review & Assessment', rate: 25000, unit: 'per_project', category: 'Analysis', description: 'Comprehensive audit and report of existing client systems and workflows.' }
        ]
      }
    }

    return { success: true, suggestions }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to generate AI onboarding suggestions' }
  }
}

/**
 * Step 3b: Save AI-selected/created services to database
 */
export async function saveOnboardingServices(
  workspaceId: string,
  services: SuggestedService[]
) {
  const supabase = await createClient()

  try {
    const servicesToInsert = services.map(s => ({
      workspace_id: workspaceId,
      name: s.name,
      description: s.description,
      rate: s.rate,
      unit: s.unit,
      category: s.category,
      is_active: true
    }))

    const { error } = await supabase.from('services').insert(servicesToInsert)
    if (error) throw error

    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to save services' }
  }
}

/**
 * Step 4: Complete Onboarding & Redirect
 */
export async function completeOnboarding(workspaceId: string) {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('workspaces')
      .update({ onboarding_completed: true })
      .eq('id', workspaceId)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message || 'Failed to complete onboarding' }
  }
}
