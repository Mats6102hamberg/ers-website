# 🛡️ Enterprise Research Shield (ERS)

**Säkerhetsmodul för innehållsscanning och sanitering**

## Snabbstart

```bash
# 1. Installera dependencies
npm install

# 2. Konfigurera databas
cp .env.example .env
# Redigera .env och lägg till DATABASE_URL

# 3. Kör migrations
npx prisma migrate dev
npx prisma generate

# 4. Starta server
npm run dev

# 5. Öppna dashboard
open http://localhost:3030/security-dashboard
```

## 🎯 Vad är ERS?

Enterprise Research Shield är en fristående säkerhetsmodul som:
- ✅ Scannar innehåll efter känslig information
- ✅ Maskerar/saniterar personnummer, saksnummer, medicinska data
- ✅ Loggar alla skanningar till PostgreSQL
- ✅ Blockerar emails med för hög risk
- ✅ Stödjer Norge-specifika mönster (fødselsnummer, saksnummer)
- ✅ Kan integreras med Ollama för AI-djupanalys

## 🔌 Integration med Ebrevsmotor

ERS är designad för att integreras med din befintliga ebrevsmotor:

```javascript
// I ebrevsmotor/server.js
const { scanEmailContent } = require('./ers-middleware');

// Scanna email innan utskick
const ersResult = await scanEmailContent({
  subject: 'Test',
  html: '<p>Innehåll med personnummer 010190-12345</p>',
  text: 'Innehåll...',
  to: 'recipient@example.com',
  campaignId: '123'
});

if (!ersResult.allowed) {
  console.log('🚫 Email blockerad - för hög risk');
} else {
  // Skicka saniterad version
  sendMail(ersResult.sanitizedEmail);
}
```

## 📊 Live Dashboard

Dashboard visar real-time statistik:
- Totala skanningar per timme/dag/vecka/månad
- Blockerade emails
- Genomsnittlig risk score
- Profil-breakdown (MEDICAL, SOCIAL, ENTERPRISE)
- Senaste varningar
- Högsta riskfynd

**URL:** `http://localhost:3030/security-dashboard`

## 🇳🇴 Norge-specifika Mönster

### SOCIAL-profilen innehåller:

| Mönster | Regex | Severity | Maskering |
|---------|-------|----------|-----------|
| Fødselsnummer | `\b(\d{6}\s?\d{5})\b` | CRITICAL | `[FØDSELSNUMMER MASKERT]` |
| Saksnummer | `\b(SAK\|SAKSNR)[:\s-]?(\d{4}[-\/]\d{4,6})\b` | HIGH | `[SAKSNUMMER MASKERT]` |
| NAV-beslut | `\b(BESLUT\|VEDTAK)[:\s-]?(\d{6,10})\b` | HIGH | `[BESLUTSNUMMER MASKERAT]` |
| Personnummer (SE) | `\b(\d{6}[-\s]?\d{4})\b` | CRITICAL | `[PERSONNUMMER MASKERAT]` |

## 🤖🤖 AI Council - Dubbel Säkerhetsanalys (Ny Feature!)

ERS har nu integrerat **AI Council** med två modeller som analyserar parallellt:

### Risk-AI (Qwen 2.5:7b) - Strikt säkerhet
- ✅ **SQL Injection** - Detekterar code injection patterns konservativt
- ✅ **PII-läckage** - Fångar norsk PII i fritext (fødselsnummer, helseopplysningar)
- ✅ **Malicious Content** - Flaggar misstänkt innehåll aggressivt

### Analys-AI (Llama 3.1:8b) - Kontextförståelse
- ✅ **SQL Injection** - Skiljer mellan faktiska hot och utbildningsmaterial
- ✅ **PII-läckage** - Kontrollerar om data redan är maskerad/saniterad
- ✅ **Malicious Content** - Förstår användarens intention och kontext

### Vaktmästar-logik: Safety First
Om **någon** AI flaggar **CRITICAL/HIGH** → **BLOCKERA** omedelbart

### Installera Ollama + AI Council:

```bash
# Installera Ollama
curl https://ollama.ai/install.sh | sh

# Ladda ner BÅDA modeller för AI Council
ollama pull qwen2.5:7b      # Risk-AI
ollama pull llama3.1:8b     # Analys-AI

# Starta Ollama server
ollama serve

# Aktivera i .env
NEXT_PUBLIC_OLLAMA_ENABLED=true
OLLAMA_RISK_MODEL=qwen2.5:7b
OLLAMA_ANALYSIS_MODEL=llama3.1:8b
ENABLE_DEEP_SCAN=true
```

### Testa AI-analys:

```bash
# Kör test-suite
node test-ai-analysis.js

# Eller testa manuellt:
curl -X POST "http://localhost:3030/api/security/ai-analyze" \
  -H "Content-Type: application/json" \
  -d '{"text": "SELECT * FROM users WHERE 1=1"}'
```

**Se fullständig guide:** [AI_COUNCIL_GUIDE.md](./AI_COUNCIL_GUIDE.md) (AI Council) | [AI_ANALYSIS_GUIDE.md](./AI_ANALYSIS_GUIDE.md) (Single AI - legacy)

## 📁 Filstruktur

```
src/lib/
├── ai-analyzer.ts              # 🆕 AI-analys med Qwen 2.5
└── gateway-core/
    ├── SecurityProfile.ts          # Profiler (MEDICAL, SOCIAL, ENTERPRISE)
    ├── ContentScanner.ts           # Regex + AI-scanning (uppdaterad)
    ├── SecurityAuditor.ts          # PostgreSQL audit logging
    ├── EnterpriseResearchShield.ts # Huvudmodul
    └── OllamaSecurityBridge.ts     # Legacy Ollama-integration

src/app/api/security/
├── stats/route.ts              # GET /api/security/stats
├── alerts/route.ts             # GET /api/security/alerts
├── scan/route.ts               # POST /api/security/scan (uppdaterad)
└── ai-analyze/route.ts         # 🆕 POST /api/security/ai-analyze

src/app/security-dashboard/
└── page.tsx                    # Live-dashboard (med AI-sektion)

Dokumentation:
├── AI_ANALYSIS_GUIDE.md        # 🆕 Komplett AI-guide
├── test-ai-analysis.js         # 🆕 Test-suite för AI
└── ERS_README.md               # Uppdaterad README
```

## 📧 Email-Alerts (Ny Feature!)

ERS skickar nu automatiska email-notifieringar vid **CRITICAL/HIGH** hot:

### Setup:

```bash
# 1. Skapa gratis Resend-konto på https://resend.com
# 2. Lägg till API-nyckel i .env.local

SMTP_ENABLED=true
RESEND_API_KEY=re_xxxxxxxxxxxx
ADMIN_ALERT_EMAIL=security@yourdomain.com
ALERT_FROM_EMAIL=alerts@yourdomain.com
```

### Vad händer vid hot:

1. **Regex-scanning** - Hitta PII (fødselsnummer, saksnummer, etc.)
2. **AI-analys** - Qwen 2.5 analyserar saniterat innehåll
3. **Threat detected?** - Loggas till databas
4. **HIGH/CRITICAL?** - Email skickas + Request blockeras (403)

**Se fullständig guide:** [EMAIL_ALERTS_GUIDE.md](./EMAIL_ALERTS_GUIDE.md)

## 🧪 Testning

```bash
# Test 1: Scanna innehåll (triggerar email om hot hittas)
curl -X POST "http://localhost:3030/api/security/scan" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "SELECT * FROM users WHERE 1=1; fødselsnummer: 010190-12345",
    "profileType": "SOCIAL",
    "contentType": "email_body",
    "recipientEmail": "user@example.com"
  }'

# Test 2: Hämta statistik
curl "http://localhost:3030/api/security/stats?timeRange=day"

# Test 3: Hämta varningar
curl "http://localhost:3030/api/security/alerts?limit=10"

# Test 4: AI-analys direkt
curl -X POST "http://localhost:3030/api/security/ai-analyze" \
  -H "Content-Type: application/json" \
  -d '{"text": "'; DROP TABLE users; --"}'
```

## 🚀 Deployment

Se [ERS_DEPLOYMENT_GUIDE.md](./ERS_DEPLOYMENT_GUIDE.md) för fullständig deployment-guide.

### Snabb Vercel Deploy:

```bash
vercel --prod
```

Glöm inte att sätta miljövariabler i Vercel Dashboard:
- `DATABASE_URL`
- `OLLAMA_URL` (optional)
- `ERS_PROFILE`

## 📈 Risk Scoring

| Risk Score | Severity | Färg | Åtgärd |
|------------|----------|------|--------|
| 0-49 | LOW | Grön | Tillåt |
| 50-99 | MEDIUM | Gul | Tillåt + Logga |
| 100-199 | HIGH | Orange | Sanitera + Logga |
| 200+ | CRITICAL | Röd | **BLOCKERA** |

## 🔒 Säkerhetsprofiler

### MEDICAL
För vårdinrättningar och medicinska system.
- Journalnummer, diagnoskoder, receptnummer
- Personnummer, medicinska termer

### SOCIAL (Rekommenderad för Norge-mötet)
För socialtjänst, NAV, kommuner.
- Personnummer (SE + NO)
- Saksnummer, NAV-beslut
- Kontonummer

### ENTERPRISE
För företag och organisationer.
- API-nycklar, email, telefon
- Organisationsnummer, kreditkort

## 📞 Support

**Skapad:** 20 december 2025  
**För:** Norge säkerhetsbolags-möte  
**Kontakt:** Mats Hamberg

---

**🎯 Redo för Norge-mötet!**
