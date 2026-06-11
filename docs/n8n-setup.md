# n8n Automation Setup Guide for Onespace AI

## Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for the main application)

## Quick Start

### 1. Start n8n Locally

```bash
# From the project root
docker compose -f docker/docker-compose.n8n.yml up -d
```

Access n8n at: **http://localhost:5678**

**Default Credentials:**
- Username: `admin`
- Password: `onespace-n8n-dev`

### 2. Configure Environment Variables

Add these to your `.env.local`:
```env
N8N_WEBHOOK_URL=http://localhost:5678
N8N_API_KEY=<your-n8n-api-key>
```

To get your n8n API key:
1. Open n8n at http://localhost:5678
2. Go to Settings → API
3. Create a new API key
4. Copy it to your `.env.local`

### 3. Set Up Webhook Workflows

Onespace AI communicates with n8n via webhooks. Below are the pre-built automation templates:

---

## Available Automation Templates

### Invoice Overdue Reminder
**Trigger:** Invoice status becomes 'overdue' OR invoice is overdue for X days  
**Action:** Send reminder email via Gmail API

Webhook URL: `POST {N8N_WEBHOOK_URL}/webhook/invoice-overdue`

```json
{
  "invoice_id": "uuid",
  "invoice_number": "INV-0001",
  "customer_name": "ABC Corp",
  "customer_email": "client@example.com",
  "amount": 25000,
  "due_date": "2025-01-15",
  "days_overdue": 7,
  "workspace_id": "uuid"
}
```

### Contract Renewal Reminder
**Trigger:** Contract renewal date is within X days  
**Action:** Send renewal reminder email + create calendar event

Webhook URL: `POST {N8N_WEBHOOK_URL}/webhook/contract-renewal`

```json
{
  "document_id": "uuid",
  "customer_name": "ABC Corp",
  "customer_email": "client@example.com",
  "contract_value": 50000,
  "renewal_date": "2025-02-01",
  "days_until_renewal": 7,
  "workspace_id": "uuid"
}
```

### Weekly Business Report
**Trigger:** Every Monday at 9:00 AM  
**Action:** Generate weekly summary and email to workspace owner

Webhook URL: `POST {N8N_WEBHOOK_URL}/webhook/weekly-report`

```json
{
  "workspace_id": "uuid",
  "report_data": {
    "new_customers": 5,
    "revenue": 125000,
    "pending_invoices": 3,
    "overdue_invoices": 2,
    "upcoming_renewals": 1
  }
}
```

### Customer Follow-Up
**Trigger:** No activity with a customer for X days  
**Action:** Send follow-up email + create task

Webhook URL: `POST {N8N_WEBHOOK_URL}/webhook/customer-followup`

```json
{
  "customer_id": "uuid",
  "customer_name": "ABC Corp",
  "customer_email": "client@example.com",
  "last_activity_date": "2025-01-01",
  "days_inactive": 30,
  "workspace_id": "uuid"
}
```

---

## Architecture

```
Onespace AI (Next.js)                    n8n
┌────────────────────┐              ┌──────────────┐
│                    │   Webhook    │              │
│  Automation Engine │───────────→  │  Workflow    │
│                    │   POST       │  Engine      │
│  API Routes        │              │              │
│  /api/webhooks/n8n │←───────────  │  Actions     │
│                    │   Callback   │  (Email,     │
└────────────────────┘              │   Calendar)  │
                                    └──────────────┘
```

## Production Deployment

For production, consider:

1. **n8n Cloud**: Use [n8n.io](https://n8n.io) managed hosting
2. **Self-hosted**: Deploy n8n on your own server with:
   - PostgreSQL database (instead of SQLite)
   - Redis for queue management
   - HTTPS with reverse proxy (nginx/caddy)
   - Persistent volume for workflow data

### Production Docker Compose

```yaml
# docker-compose.prod.yml
services:
  n8n:
    image: n8nio/n8n:latest
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=your-db-host
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=your-password
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your-secure-password
      - WEBHOOK_URL=https://n8n.yourdomain.com
      - N8N_ENCRYPTION_KEY=your-encryption-key
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| n8n not starting | Check Docker is running: `docker ps` |
| Webhook not receiving | Verify `N8N_WEBHOOK_URL` in `.env.local` matches n8n URL |
| CORS errors | n8n handles CORS automatically for webhook endpoints |
| Container logs | `docker logs onespace-n8n` |
| Reset n8n | `docker compose -f docker/docker-compose.n8n.yml down -v && docker compose -f docker/docker-compose.n8n.yml up -d` |
