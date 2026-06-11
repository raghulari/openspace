// ============================================
// Onespace AI - Gemini AI Client
// ============================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY

interface GeminiResponse {
  text: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

interface GeminiOptions {
  temperature?: number
  maxTokens?: number
  model?: string
}

const DEFAULT_MODEL = 'gemini-2.0-flash'

/**
 * Call the Gemini API with a text prompt
 */
export async function generateText(
  prompt: string,
  options: GeminiOptions = {}
): Promise<GeminiResponse> {
  const {
    temperature = 0.7,
    maxTokens = 2048,
    model = DEFAULT_MODEL,
  } = options

  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${response.status} - ${error}`)
  }

  const data = await response.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  return {
    text,
    usage: data.usageMetadata
      ? {
          promptTokens: data.usageMetadata.promptTokenCount ?? 0,
          completionTokens: data.usageMetadata.candidatesTokenCount ?? 0,
          totalTokens: data.usageMetadata.totalTokenCount ?? 0,
        }
      : undefined,
  }
}

/**
 * Extract structured data from a document
 */
export async function extractDocumentData(
  documentText: string,
  documentName: string
): Promise<Record<string, unknown>> {
  const prompt = `Analyze this business document and extract the following structured data as JSON:

Document Name: ${documentName}
Document Content:
${documentText}

Extract:
- customer_name: The customer or client name
- contract_value: Any monetary amounts/contract values (as number)
- renewal_date: Contract renewal or expiry date (ISO format)
- deadlines: Array of important deadlines
- services: Array of services mentioned
- payment_terms: Payment terms mentioned
- summary: A 2-3 sentence summary
- action_items: Array of required actions
- important_dates: Array of important dates with descriptions

Return ONLY valid JSON, no other text.`

  const result = await generateText(prompt, {
    temperature: 0.3,
    maxTokens: 2048,
  })

  try {
    return JSON.parse(result.text)
  } catch {
    return { raw_response: result.text, parse_error: true }
  }
}

/**
 * Summarize meeting notes and extract decisions/tasks
 */
export async function summarizeMeetingNotes(
  notes: string,
  attendees?: string[]
): Promise<Record<string, unknown>> {
  const prompt = `Analyze these meeting notes and extract structured information as JSON:

Meeting Notes:
${notes}
${attendees ? `\nAttendees: ${attendees.join(', ')}` : ''}

Extract:
- summary: A concise 3-5 sentence summary of the meeting
- decisions: Array of decisions made (strings)
- tasks: Array of objects with { task, assignee, deadline }
- deadlines: Array of objects with { description, date }
- risks: Array of risks or concerns mentioned (strings)
- requirements: Array of requirements discussed (strings)
- follow_ups: Array of follow-up items needed (strings)

Return ONLY valid JSON, no other text.`

  const result = await generateText(prompt, {
    temperature: 0.3,
    maxTokens: 2048,
  })

  try {
    return JSON.parse(result.text)
  } catch {
    return { raw_response: result.text, parse_error: true }
  }
}

/**
 * Generate AI business insights from aggregated data
 */
export async function generateBusinessInsights(
  data: Record<string, unknown>
): Promise<string> {
  const prompt = `You are an AI business analyst for a small-to-medium business. Based on this business data, provide 3-5 actionable insights:

Business Data:
${JSON.stringify(data, null, 2)}

Format your response as bullet points. Be specific, mention numbers, and suggest concrete actions.`

  const result = await generateText(prompt, {
    temperature: 0.5,
    maxTokens: 1024,
  })

  return result.text
}

/**
 * Chat with the AI Business Copilot
 */
export async function chatWithCopilot(
  message: string,
  context: Record<string, unknown>,
  conversationHistory: Array<{ role: string; content: string }> = []
): Promise<string> {
  const systemContext = `You are the Onespace AI Business Copilot — an intelligent assistant that helps business owners manage their operations.

You have access to the following business context:
${JSON.stringify(context, null, 2)}

Guidelines:
- Be concise and actionable
- Reference specific data when available
- Format responses with bullet points or tables when helpful
- If you don't have enough data, say so honestly
- Use ₹ (INR) for currency
- Suggest follow-up questions when appropriate`

  const historyText = conversationHistory
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join('\n')

  const prompt = `${systemContext}

${historyText ? `Previous conversation:\n${historyText}\n` : ''}
User: ${message}

Respond helpfully:`

  const result = await generateText(prompt, {
    temperature: 0.6,
    maxTokens: 2048,
  })

  return result.text
}

/**
 * Generate invoice description using AI
 */
export async function generateInvoiceDescription(
  serviceName: string,
  customerName: string,
  additionalContext?: string
): Promise<string> {
  const prompt = `Generate a professional invoice line item description for:
- Service: ${serviceName}
- Customer: ${customerName}
${additionalContext ? `- Context: ${additionalContext}` : ''}

Return ONLY the description text (1-2 sentences), nothing else.`

  const result = await generateText(prompt, {
    temperature: 0.5,
    maxTokens: 256,
  })

  return result.text.trim()
}

/**
 * Suggest payment terms for an invoice
 */
export async function suggestPaymentTerms(
  customerName: string,
  invoiceAmount: number,
  industry?: string
): Promise<string> {
  const prompt = `Suggest appropriate payment terms for this invoice:
- Customer: ${customerName}
- Amount: ₹${invoiceAmount.toLocaleString('en-IN')}
${industry ? `- Industry: ${industry}` : ''}

Return ONLY the payment terms text (2-3 sentences), nothing else. Be professional and include standard terms like Net 30, advance payment %, etc.`

  const result = await generateText(prompt, {
    temperature: 0.5,
    maxTokens: 256,
  })

  return result.text.trim()
}
