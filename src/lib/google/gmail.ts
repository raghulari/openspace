// ─── Gmail Helpers ──────────────────────────────────────────
// Handles email sending and drafting via Gmail API.

const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1";

export interface EmailAddress {
  name?: string;
  email: string;
}

export interface EmailAttachment {
  filename: string;
  mimeType: string;
  content: string; // base64 encoded
}

export interface SendEmailOptions {
  to: EmailAddress[];
  cc?: EmailAddress[];
  bcc?: EmailAddress[];
  subject: string;
  body: string;
  isHtml?: boolean;
  attachments?: EmailAttachment[];
}

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
}

export interface CreateDraftOptions {
  to: EmailAddress[];
  cc?: EmailAddress[];
  subject: string;
  body: string;
  isHtml?: boolean;
}

export interface GmailDraft {
  id: string;
  message: GmailMessage;
}

/**
 * Format an email address for RFC 2822 headers.
 */
function formatAddress(addr: EmailAddress): string {
  return addr.name ? `${addr.name} <${addr.email}>` : addr.email;
}

/**
 * Build a raw RFC 2822 email message and base64url encode it.
 */
function buildRawEmail(options: SendEmailOptions | CreateDraftOptions): string {
  const headers = [
    `To: ${options.to.map(formatAddress).join(", ")}`,
    `Subject: ${options.subject}`,
    `MIME-Version: 1.0`,
  ];

  if (options.cc && options.cc.length > 0) {
    headers.push(`Cc: ${options.cc.map(formatAddress).join(", ")}`);
  }

  const contentType =
    "isHtml" in options && options.isHtml
      ? "text/html; charset=utf-8"
      : "text/plain; charset=utf-8";
  headers.push(`Content-Type: ${contentType}`);

  const raw = `${headers.join("\r\n")}\r\n\r\n${options.body}`;

  // Base64url encode
  if (typeof Buffer !== "undefined") {
    return Buffer.from(raw)
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Send an email via Gmail API.
 */
export async function sendEmail(
  accessToken: string,
  options: SendEmailOptions
): Promise<GmailMessage> {
  // TODO: Add attachment support
  const raw = buildRawEmail(options);

  const response = await fetch(`${GMAIL_API_BASE}/users/me/messages/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });

  if (!response.ok) {
    throw new Error(`Failed to send email: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Create a draft email in Gmail.
 */
export async function createDraft(
  accessToken: string,
  options: CreateDraftOptions
): Promise<GmailDraft> {
  // TODO: Implement draft creation
  const raw = buildRawEmail(options);

  const response = await fetch(`${GMAIL_API_BASE}/users/me/drafts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: { raw },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create draft: ${response.statusText}`);
  }

  return response.json();
}
