# 📧 Email Alerts - Proaktiv säkerhetsövervakning

## Översikt

Email-alerts skickas automatiskt till säkerhetschefen när en CRITICAL risk (≥200) detekteras. Detta visar proaktivitet och säkerställer att kritiska händelser hanteras omedelbart.

## Vad som implementerades

### 1. EmailAlertService
**Fil:** `src/lib/gateway-core/EmailAlertService.ts`

**Funktioner:**
- `sendAdminAlert(auditData)` - Skickar email vid CRITICAL risk
- `buildAlertEmail(auditData)` - Bygger HTML + text email
- Identifierar norska mönster automatiskt
- Vacker HTML-formatering med färgkodning

### 2. Integration i EnterpriseResearchShield
**Fil:** `src/lib/gateway-core/EnterpriseResearchShield.ts`

**Ändring:**
```typescript
// Send admin alert if CRITICAL risk detected
if (blocked) {
  await emailAlertService.sendAdminAlert({
    profileType: this.config.profileType,
    contentType: context.contentType,
    scanResult,
    campaignId: context.campaignId,
    recipientEmail: context.recipientEmail,
    timestamp: new Date()
  });
}
```

### 3. API Endpoint
**Fil:** `src/app/api/security/send-alert/route.ts`

```bash
POST /api/security/send-alert
```

**Body:**
```json
{
  "to": "security@example.com",
  "subject": "🚨 CRITICAL Security Alert",
  "html": "<html>...</html>",
  "text": "Plain text version..."
}
```

## Email-format

### Subject:
```
🚨 CRITICAL Security Alert - Risk Score 220
```

### HTML Email Design:

```
┌─────────────────────────────────────────┐
│  🚨 CRITICAL SECURITY ALERT             │
│  Enterprise Research Shield             │
├─────────────────────────────────────────┤
│  ⚠️ En email har blockerats på grund    │
│     av för hög risk-score.              │
├─────────────────────────────────────────┤
│  Tidpunkt:      2025-12-20 07:15:30     │
│  Risk Score:    [220] (CRITICAL)        │
│  Profil:        SOCIAL                  │
│  Innehållstyp:  email_text              │
│  Kampanj-ID:    camp_123                │
│  Mottagare:     user@example.com        │
├─────────────────────────────────────────┤
│  📋 Fynd (3 st)                         │
│  ┌───────────────────────────────────┐  │
│  │ Norwegian Fødselsnummer (CRITICAL)│  │
│  │ Matchat: 010190-12345             │  │
│  ├───────────────────────────────────┤  │
│  │ Saksnummer (HIGH)                 │  │
│  │ Matchat: SAK-2024/12345           │  │
│  ├───────────────────────────────────┤  │
│  │ Bank Account Number (MEDIUM)      │  │
│  │ Matchat: 1234-56-78901            │  │
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  🇳🇴 Norska mönster som triggades (2 st)│
│  - Norwegian Fødselsnummer              │
│    Matchat: 010190-12345                │
│  - Saksnummer                           │
│    Matchat: SAK-2024/12345              │
├─────────────────────────────────────────┤
│  ⚠️ Åtgärd vidtagen                     │
│  Emailen har BLOCKERATS och skickades   │
│  INTE till mottagaren.                  │
├─────────────────────────────────────────┤
│  Detta är en automatisk varning från    │
│  Enterprise Research Shield.            │
│  Kontrollera dashboarden för mer info.  │
└─────────────────────────────────────────┘
```

## Konfiguration

### Miljövariabler (.env):

```bash
# Email Alerts
SMTP_ENABLED="true"                          # Aktivera email-alerts
ADMIN_ALERT_EMAIL="security@example.com"     # Mottagare
ALERT_FROM_EMAIL="alerts@ers.com"            # Avsändare
RESEND_API_KEY="re_xxxxxxxxxxxx"             # Resend API-nyckel (optional)
NEXT_PUBLIC_DASHBOARD_URL="https://ers.com"  # Dashboard URL i email
```

### SMTP-providers som stöds:

1. **Resend** (Rekommenderad för Next.js)
```bash
npm install resend
RESEND_API_KEY="re_xxxxxxxxxxxx"
```

2. **SendGrid**
```bash
npm install @sendgrid/mail
SENDGRID_API_KEY="SG.xxxxxxxxxxxx"
```

3. **Nodemailer** (För custom SMTP)
```bash
npm install nodemailer
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

## Användning

### Automatisk triggning:

Email skickas automatiskt när:
1. En scanning resulterar i risk-score ≥ 200
2. Innehållet blockeras från att skickas
3. SMTP är aktiverat (`SMTP_ENABLED=true`)

### Test-mode:

Om `SMTP_ENABLED=false`:
- Email skickas INTE
- Loggas istället till console
- Perfekt för development/testing

```
📧 [ALERT] SMTP disabled - Alert would be sent:
{
  to: 'security@example.com',
  riskScore: 220,
  findings: 3
}
```

## Integration med email-providers

### Resend (Rekommenderad):

```typescript
// src/app/api/security/send-alert/route.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: process.env.ALERT_FROM_EMAIL || 'alerts@ers.com',
  to,
  subject,
  html,
  text
});
```

### SendGrid:

```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

await sgMail.send({
  from: process.env.ALERT_FROM_EMAIL || 'alerts@ers.com',
  to,
  subject,
  html,
  text
});
```

### Nodemailer:

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

await transporter.sendMail({
  from: process.env.ALERT_FROM_EMAIL,
  to,
  subject,
  html,
  text
});
```

## Norge-mötet Demo

### Scenario 1: CRITICAL alert triggad
```
1. Skapa kampanj med norska personnummer
2. Risk-score: 220 (CRITICAL)
3. Email blockeras automatiskt
4. Alert skickas till säkerhetschefen
5. Visa email i inbox (eller console om test-mode)
```

### Scenario 2: Visa proaktivitet
```
"Som ni ser här, så fort systemet detekterar en CRITICAL risk,
skickas en automatisk varning till säkerhetschefen. Detta säkerställer
att inga känsliga data läcker, och att incidenter hanteras omedelbart.

Här är ett exempel på en sådan varning..."
[Visa email med norska mönster markerade]
```

## Email-innehåll

### Information som inkluderas:

1. **Tidpunkt** - Exakt när incidenten inträffade
2. **Risk Score** - Numeriskt värde (t.ex. 220)
3. **Profil** - MEDICAL, SOCIAL, ENTERPRISE
4. **Innehållstyp** - email_subject, email_html, email_text
5. **Kampanj-ID** - För spårning
6. **Mottagare** - Vem som skulle fått emailen
7. **Alla fynd** - Lista med pattern + severity + matchat värde
8. **Norska mönster** - Särskilt markerade för Norge-mötet
9. **Åtgärd** - Bekräftelse att email blockerats

### Färgkodning:

- 🔴 **Röd header** - CRITICAL alert
- 🔵 **Blå sektion** - Norska mönster
- 🟡 **Gul box** - Åtgärd vidtagen
- ⚪ **Vit bakgrund** - Fynd-lista

## Fördelar för Norge-mötet

### 1. Proaktivitet
Visar att systemet inte bara loggar, utan **agerar** vid kritiska händelser.

### 2. Transparens
Säkerhetschefen får omedelbar information om vad som hände och varför.

### 3. Compliance
Email-alerts skapar en audit trail som kan användas för certifiering.

### 4. Norge-fokus
Norska mönster markeras särskilt, visar att systemet är anpassat för norska regler.

### 5. Snabb respons
Säkerhetschefen kan agera omedelbart om något gått fel.

## Testning

### Test 1: Simulera CRITICAL risk
```bash
curl -X POST "http://localhost:3030/api/security/scan" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Saksnummer 2024/12345, fødselsnummer 010190-12345, personnummer 901010-1234",
    "profileType": "SOCIAL",
    "contentType": "test"
  }'
```

**Förväntat resultat:**
- Risk score: ~300 (CRITICAL)
- Email alert skickas (eller loggas om test-mode)
- Console visar: `✅ [ALERT] Email sent to security@example.com`

### Test 2: Verifiera email-format
```bash
# Sätt SMTP_ENABLED=false
# Kör test ovan
# Kontrollera console output
```

### Test 3: Test med Resend
```bash
# Sätt SMTP_ENABLED=true
# Sätt RESEND_API_KEY
# Kör test
# Kontrollera inbox
```

## Felsökning

### Problem: Email skickas inte
**Lösning:**
1. Kontrollera att `SMTP_ENABLED=true`
2. Verifiera `ADMIN_ALERT_EMAIL` är korrekt
3. Kontrollera API-nyckel (Resend/SendGrid)
4. Kolla console för felmeddelanden

### Problem: Email hamnar i spam
**Lösning:**
1. Använd verifierad avsändar-domän
2. Lägg till SPF/DKIM records
3. Använd professionell email-provider (Resend)

### Problem: Fel format i email
**Lösning:**
1. Kontrollera att HTML är valid
2. Testa i olika email-klienter
3. Använd inline CSS (redan implementerat)

## Performance

### Optimering:
- Email skickas asynkront (påverkar inte scanning)
- Timeout på 5 sekunder för email-sending
- Fallback till console-logging vid fel

### Rate limiting:
- Ingen limit på antal alerts (viktigt för säkerhet)
- Överväg att gruppera alerts om >10 per minut

## Framtida förbättringar

1. **Slack/Teams integration** - Skicka alerts till chat
2. **SMS alerts** - För extra kritiska händelser
3. **Alert aggregering** - Sammanfatta flera alerts i en email
4. **Custom templates** - Olika email-format per profil
5. **Alert history** - Dashboard för att se alla skickade alerts
6. **Escalation** - Skicka till fler mottagare om ingen svarar

## Sammanfattning

✅ **EmailAlertService** skapad med HTML + text formatering  
✅ **Integration** i EnterpriseResearchShield vid risk ≥ 200  
✅ **API endpoint** för att skicka emails (`/api/security/send-alert`)  
✅ **Miljövariabler** för SMTP-konfiguration  
✅ **Norge-fokus** - Norska mönster markeras särskilt  
✅ **Test-mode** - Loggar till console om SMTP disabled  
✅ **Vacker HTML** - Professionell design med färgkodning  
✅ **Proaktivitet** - Visar att systemet agerar, inte bara loggar  

**Status:** Klar för Norge-mötet! 🇳🇴

---

**Email-alerts visar proaktivitet och säkerställer att kritiska händelser hanteras omedelbart!**
