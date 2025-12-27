# 📧 Email Alerts för ERS - Komplett Guide

## Översikt

Enterprise Research Shield kan nu skicka automatiska email-notifieringar när **CRITICAL** eller **HIGH** severity hot upptäcks av AI-analysen (Qwen 2.5).

## Workflow

```
Innehåll → Regex-scanning → AI-analys (Qwen 2.5)
                                ↓
                          Är det hot?
                                ↓
                    YES: HIGH/CRITICAL?
                                ↓
                    Email till admin + Blockera
                                ↓
                    Logga till databas
```

## Installation & Konfiguration

### 1. Resend API (Rekommenderat)

**Varför Resend?**
- Enkel integration
- Gratis tier: 100 emails/dag
- Bra deliverability
- Stödjer alla email-providers

**Setup:**

```bash
# 1. Skapa konto på https://resend.com
# 2. Skapa API-nyckel i dashboard
# 3. Lägg till i .env.local

SMTP_ENABLED=true
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
ADMIN_ALERT_EMAIL=security@yourdomain.com
ALERT_FROM_EMAIL=alerts@yourdomain.com
NEXT_PUBLIC_DASHBOARD_URL=https://your-ers-domain.com
```

### 2. Verifiera domän (för Resend)

Om du vill skicka från `alerts@yourdomain.com`:

1. Gå till Resend Dashboard → Domains
2. Lägg till din domän
3. Uppdatera DNS-records (SPF, DKIM, DMARC)
4. Vänta på verifiering (~5 min)

**Alternativt:** Använd Resend's testdomän `onboarding@resend.dev` (endast för testing)

## Användning

### API Request

```bash
curl -X POST "http://localhost:3030/api/security/scan" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "SELECT * FROM users WHERE 1=1; fødselsnummer: 010190-12345",
    "profileType": "SOCIAL",
    "contentType": "email_body",
    "recipientEmail": "user@example.com"
  }'
```

**Response om CRITICAL hot:**

```json
{
  "success": false,
  "error": "Blocked by Security AI",
  "data": {
    "allowed": false,
    "blocked": true,
    "reason": "SQL injection attempt detected with Norwegian PII",
    "severity": "CRITICAL",
    "category": "SQL_INJECTION"
  }
}
```

### Email som skickas

**Subject:** 🚨 ERS CRITICAL ALERT: AI-Detected: SQL_INJECTION

**Innehåll:**
- Severity badge (röd för CRITICAL)
- Tidpunkt
- Källa (Qwen 2.5 Analysis)
- Mottagare (om specificerad)
- Detaljer från AI
- Innehållsförhandsvisning (första 200 tecken)
- Länk till Dashboard

## Email-template

Email-alerterna använder en professionell HTML-template med:

- ✅ Gradient header (lila/blå)
- ✅ Severity-färgkodning (grön/gul/orange/röd)
- ✅ Responsiv design
- ✅ CTA-knapp till dashboard
- ✅ Footer med branding

### Preview av email:

```
╔══════════════════════════════════════╗
║  🛡️ Enterprise Research Shield      ║
║  Säkerhetsvarning                    ║
╚══════════════════════════════════════╝

┌──────────────────────────────────────┐
│         CRITICAL SEVERITY            │
│    AI-Detected: SQL_INJECTION        │
└──────────────────────────────────────┘

Tidpunkt: 2025-12-20 14:30:15
Källa: Qwen 2.5 Analysis
Mottagare: user@example.com
Detaljer: SQL injection attempt detected

┌──────────────────────────────────────┐
│ Innehållsförhandsvisning:            │
│ SELECT * FROM users WHERE 1=1...     │
└──────────────────────────────────────┘

⚠️ Åtgärd krävs: Detta innehåll har
blockerats automatiskt.

      [Visa Dashboard]
```

## Testning

### Test 1: Manuell trigger

```bash
# Skapa en fil: test-email-alert.js
node test-email-alert.js
```

```javascript
// test-email-alert.js
const response = await fetch('http://localhost:3030/api/security/scan', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    content: "'; DROP TABLE users; -- Detta är en SQL injection attack",
    profileType: 'ENTERPRISE',
    contentType: 'api_request',
    recipientEmail: 'hacker@evil.com'
  })
});

const result = await response.json();
console.log('Result:', result);
```

### Test 2: Kontrollera inbox

- Kolla `ADMIN_ALERT_EMAIL` inbox
- Email ska komma från `ALERT_FROM_EMAIL`
- Subject: `🚨 ERS CRITICAL ALERT: AI-Detected: SQL_INJECTION`

### Test 3: Verifiera loggning

```bash
# Kontrollera databas
psql $DATABASE_URL -c "SELECT * FROM \"SecurityAudit\" WHERE blocked = true ORDER BY timestamp DESC LIMIT 5;"
```

## Databas-schema

AI-fynd loggas till `SecurityAudit` tabell:

```prisma
model SecurityAudit {
  id             String   @id @default(cuid())
  timestamp      DateTime @default(now())
  profileType    String
  contentType    String
  riskScore      Int
  findingsCount  Int
  findings       Json     // Inkluderar aiDetected-objekt
  sanitized      Boolean
  blocked        Boolean  // true om CRITICAL/HIGH
  recipientEmail String?
}
```

**AI-fynd struktur i `findings` JSON:**

```json
{
  "regularFindings": [...],
  "aiDetected": {
    "category": "SQL_INJECTION",
    "severity": "CRITICAL",
    "reason": "SQL injection attempt with DROP TABLE command"
  }
}
```

## Email-templates anpassning

### Ändra färger

I `src/lib/email-alerts.ts`:

```typescript
const severityColor = {
  LOW: '#10b981',      // Grön
  MEDIUM: '#f59e0b',   // Gul
  HIGH: '#f97316',     // Orange
  CRITICAL: '#ef4444'  // Röd
}[data.severity];
```

### Ändra branding

```typescript
// Header
<h1 style="color: white;">🛡️ DIN FÖRETAGSNAMN</h1>

// Footer
<p>DIN FÖRETAGSNAMN - AI-Driven Security</p>
```

## Miljövariabler

**Fullständig .env.local:**

```bash
# Database
DATABASE_URL="postgresql://..."

# Ollama AI
NEXT_PUBLIC_OLLAMA_ENABLED=true
OLLAMA_URL=http://localhost:11434

# Email Alerts
SMTP_ENABLED=true
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
ADMIN_ALERT_EMAIL=security@yourdomain.com
ALERT_FROM_EMAIL=alerts@yourdomain.com

# Dashboard
NEXT_PUBLIC_DASHBOARD_URL=https://your-ers-domain.com

# ERS Config
ERS_PROFILE=SOCIAL
ERS_BLOCK_THRESHOLD=200
ENABLE_DEEP_SCAN=true
```

## Felsökning

### Problem: "Email alerts disabled or not configured"

**Lösning:**
```bash
# Kontrollera att dessa är satta:
echo $SMTP_ENABLED          # Ska vara "true"
echo $ADMIN_ALERT_EMAIL     # Ska vara ett giltigt email
```

### Problem: "Resend API error: 401"

**Lösning:**
- Kontrollera att `RESEND_API_KEY` är korrekt
- Logga in på Resend Dashboard och verifiera API-nyckel
- API-nycklar börjar med `re_`

### Problem: Email hamnar i spam

**Lösning:**
1. Verifiera domän i Resend (SPF/DKIM/DMARC)
2. Använd en dedikerad domän för alerts (t.ex. `alerts.yourdomain.com`)
3. Lägg till `no-reply@yourdomain.com` i mottagarens whitelist

### Problem: Inga emails skickas trots CRITICAL hot

**Lösning:**
```bash
# Kontrollera logs
npm run dev

# Leta efter:
# ✅ "🤖 Asking Qwen 2.5 for analysis..."
# ✅ "🚨 AI Flagged Threat: SQL_INJECTION"
# ✅ "📧 Critical alert email sent: xxx"

# Om ingen email:
# - Kontrollera att SMTP_ENABLED=true
# - Kontrollera att severity är HIGH/CRITICAL
# - Kontrollera Resend Dashboard → Logs
```

## Produktions-tips

### 1. Rate limiting

Lägg till rate limiting för att undvika spam:

```typescript
// I scan/route.ts
import rateLimit from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minut
  uniqueTokenPerInterval: 500
});

if (!limiter.check(request.ip)) {
  return new Response('Too many requests', { status: 429 });
}
```

### 2. Alert-gruppering

Gruppera flera alerts inom 5 minuter till ett email:

```typescript
// Lägg till debouncing
let alertQueue = [];
let emailTimer = null;

function queueAlert(alert) {
  alertQueue.push(alert);

  if (!emailTimer) {
    emailTimer = setTimeout(() => {
      sendBatchAlert(alertQueue);
      alertQueue = [];
      emailTimer = null;
    }, 5 * 60 * 1000); // 5 minuter
  }
}
```

### 3. Backup-notifieringar

Lägg till Slack/Teams webhook som backup:

```typescript
if (emailFailed) {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    body: JSON.stringify({
      text: `🚨 ERS CRITICAL: ${data.type} - ${data.severity}`
    })
  });
}
```

## Kostnader

**Resend Pricing:**
- Free: 100 emails/dag, 3000/månad
- Pro ($20/mån): 50,000 emails/månad
- Enterprise: Custom

**Rekommendation för Norge-mötet:**
- Free tier räcker för demo och pilot
- Uppgradera till Pro vid >100 alerts/dag

## Support

**Skapad:** 2025-12-20
**Integration:** Qwen 2.5 AI + Resend Email
**För:** Norge säkerhetsbolags-möte
