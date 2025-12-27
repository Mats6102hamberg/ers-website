# Enterprise Research Shield (ERS) - Deployment Guide

## 🎯 Översikt

Enterprise Research Shield är en fristående säkerhetsmodul som scannar och saniterar innehåll innan utskick via ebrevsmotorn. Systemet har tre säkerhetsprofiler (MEDICAL, SOCIAL, ENTERPRISE) och kan integreras med Ollama för djupare AI-analys.

## 📁 Projektstruktur

### Agent Memory Vault (Next.js - ERS Core)
```
/Users/admin/CascadeProjects/agent-memory-vault/
├── src/lib/gateway-core/
│   ├── SecurityProfile.ts          # Profiler (MEDICAL, SOCIAL, ENTERPRISE)
│   ├── ContentScanner.ts           # Regex + AI-scanning
│   ├── SecurityAuditor.ts          # PostgreSQL audit logging
│   ├── EnterpriseResearchShield.ts # Huvudmodul
│   └── OllamaSecurityBridge.ts     # Lokal AI-integration
├── src/app/api/security/
│   ├── stats/route.ts              # GET /api/security/stats
│   ├── alerts/route.ts             # GET /api/security/alerts
│   └── scan/route.ts               # POST /api/security/scan
├── src/app/security-dashboard/
│   └── page.tsx                    # Live-dashboard
└── prisma/schema.prisma            # SecurityAudit-modell
```

### Ebrevsmotor (Express - Email Engine)
```
/Users/admin/ebrevsmotor/
├── server.js                       # Huvudserver (modifierad)
├── ers-middleware.js               # ERS-integration
└── .env.example                    # Miljövariabler
```

## 🔧 Installation

### 1. Agent Memory Vault (ERS Core)

```bash
cd /Users/admin/CascadeProjects/agent-memory-vault

# Installera dependencies
npm install

# Skapa .env från .env.example
cp .env.example .env

# Konfigurera DATABASE_URL i .env
# DATABASE_URL="postgresql://user:password@host:5432/database"

# Kör Prisma migration
npx prisma migrate dev --name add_security_audit
npx prisma generate

# Starta dev-server
npm run dev
```

### 2. Ebrevsmotor

```bash
cd /Users/admin/ebrevsmotor

# Installera node-fetch om den saknas
npm install node-fetch@2

# Uppdatera .env med ERS-konfiguration
ERS_API_URL=http://localhost:3001/api/security
ERS_PROFILE=SOCIAL  # För Norge-mötet
ERS_ENABLED=true
ENABLE_DEEP_SCAN=false
OLLAMA_URL=http://localhost:11434

# Starta server
npm start
```

## 🇳🇴 Norge-specifika Mönster

ERS har inbyggda regex-mönster för norska känsliga data:

### SOCIAL-profilen innehåller:
- **Fødselsnummer**: `\b(\d{6}\s?\d{5})\b`
- **Saksnummer**: `\b(SAK|SAKSNR)[:\s-]?(\d{4}[-\/]\d{4,6})\b`
- **NAV-beslut**: `\b(BESLUT|VEDTAK)[:\s-]?(\d{6,10})\b`
- **Personnummer (SE)**: `\b(\d{6}[-\s]?\d{4})\b`
- **Kontonummer**: `\b(\d{4}[\s-]?\d{2}[\s-]?\d{5})\b`

### Exempel på maskering:
```
Input:  "Saksnummer: 2024/12345, fødselsnummer 010190-12345"
Output: "Saksnummer: [SAKSNUMMER MASKERT], fødselsnummer [FØDSELSNUMMER MASKERT]"
```

## 🚀 Vercel Deployment

### Agent Memory Vault

```bash
cd /Users/admin/CascadeProjects/agent-memory-vault

# Logga in på Vercel
vercel login

# Länka projekt (första gången)
vercel link

# Lägg till miljövariabler i Vercel Dashboard:
# - DATABASE_URL (Neon Postgres connection string)
# - OLLAMA_URL (optional, för deep scan)
# - ERS_PROFILE (MEDICAL, SOCIAL eller ENTERPRISE)
# - ERS_BLOCK_THRESHOLD (default: 200)

# Deploy
vercel --prod
```

### Miljövariabler i Vercel:

1. Gå till Vercel Dashboard → Settings → Environment Variables
2. Lägg till:
   - `DATABASE_URL`: Din Neon Postgres connection string
   - `OLLAMA_URL`: `http://your-ollama-server:11434` (optional)
   - `NEXT_PUBLIC_OLLAMA_ENABLED`: `false` (eller `true` om Ollama används)

## 📊 Dashboard

Live-dashboard finns på: `https://your-domain.vercel.app/security-dashboard`

### Features:
- ✅ Real-time statistik (auto-refresh var 10:e sekund)
- ✅ Totala skanningar, blockerade emails, genomsnittlig risk
- ✅ Profil-breakdown (MEDICAL, SOCIAL, ENTERPRISE)
- ✅ Senaste varningar med risk-scores
- ✅ Högsta riskfynd med detaljer
- ✅ Norge-specifik status

## 🔌 API Endpoints

### GET /api/security/stats
```bash
curl "https://your-domain.vercel.app/api/security/stats?timeRange=day"
```

Response:
```json
{
  "success": true,
  "data": {
    "timeRange": "day",
    "totalScans": 142,
    "blockedCount": 3,
    "avgRiskScore": 45.2,
    "profileBreakdown": [
      { "profile": "SOCIAL", "count": 89, "totalRisk": 3420 },
      { "profile": "ENTERPRISE", "count": 53, "totalRisk": 1180 }
    ],
    "scanRate": 5.9,
    "blockRate": 2.1
  }
}
```

### GET /api/security/alerts
```bash
curl "https://your-domain.vercel.app/api/security/alerts?limit=20"
```

### POST /api/security/scan
```bash
curl -X POST "https://your-domain.vercel.app/api/security/scan" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Test med personnummer 010190-12345",
    "profileType": "SOCIAL",
    "contentType": "email_text"
  }'
```

## 🤖 Ollama Security Bridge (Optional)

För djupare AI-analys kan du aktivera Ollama:

### Installation:
```bash
# Installera Ollama
curl https://ollama.ai/install.sh | sh

# Ladda ner modell
ollama pull llama2

# Starta Ollama server
ollama serve
```

### Aktivera i ERS:
```bash
# I agent-memory-vault/.env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
OLLAMA_ENABLED=true
NEXT_PUBLIC_OLLAMA_ENABLED=true

# I ebrevsmotor/.env
ENABLE_DEEP_SCAN=true
OLLAMA_URL=http://localhost:11434
```

## 🧪 Testning

### Test 1: Scanna innehåll med norska mönster
```bash
curl -X POST "http://localhost:3001/api/security/scan" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Saksnummer 2024/12345, fødselsnummer 010190-12345",
    "profileType": "SOCIAL",
    "contentType": "test"
  }'
```

### Test 2: Skicka kampanj via ebrevsmotor
1. Skapa kampanj med känsligt innehåll
2. Försök skicka via `/api/campaigns/:id/send`
3. Kontrollera att ERS scannar och saniterar
4. Verifiera i dashboard att scanning loggades

### Test 3: Kontrollera dashboard
```bash
# Öppna i webbläsare
open http://localhost:3001/security-dashboard
```

## 📈 Norge-mötet Demo

### Förberedelser:
1. ✅ Starta agent-memory-vault: `npm run dev` (port 3001)
2. ✅ Starta ebrevsmotor: `npm start` (port 3000)
3. ✅ Öppna dashboard: `http://localhost:3001/security-dashboard`
4. ✅ Sätt profil till SOCIAL i ebrevsmotor/.env

### Demo-scenario:
1. **Visa dashboard** - Live-statistik och Norge-specifika mönster
2. **Skapa testkampanj** med norska personnummer och saksnummer
3. **Skicka kampanj** - Visa att ERS scannar och saniterar
4. **Visa i dashboard** - Real-time uppdatering av statistik
5. **Visa alerts** - Detaljerad logg av vad som hittades

### Demo-data:
```
Subject: Viktig information om ditt ärende
Body: 
Hej,

Ditt saksnummer är 2024/12345.
Ditt fødselsnummer: 010190-12345
Beslut: VEDTAK-2024-001

Vänliga hälsningar
```

**Förväntat resultat:**
- 3 fynd (saksnummer, fødselsnummer, beslut)
- Risk score: ~150 (HIGH)
- Saniterad output med maskerade värden
- Loggat i dashboard

## 🔒 Säkerhetsprofiler

### MEDICAL
- Journalnummer, diagnoskoder, receptnummer
- Risk threshold: CRITICAL
- Kräver kryptering

### SOCIAL (Norge-mötet)
- Personnummer (SE + NO)
- Saksnummer, NAV-beslut
- Kontonummer
- Risk threshold: HIGH

### ENTERPRISE
- API-nycklar, email, telefon
- Organisationsnummer, kreditkort
- Risk threshold: MEDIUM

## 📝 Troubleshooting

### Problem: ERS blockerar inte emails
**Lösning:** Kontrollera att `ERS_ENABLED=true` i ebrevsmotor/.env

### Problem: Dashboard visar inga data
**Lösning:** 
1. Kontrollera DATABASE_URL i agent-memory-vault/.env
2. Kör `npx prisma migrate dev`
3. Verifiera att SecurityAudit-tabellen finns

### Problem: Ollama fungerar inte
**Lösning:**
1. Kontrollera att Ollama server körs: `curl http://localhost:11434/api/tags`
2. Verifiera att modell är nedladdad: `ollama list`
3. Sätt `ENABLE_DEEP_SCAN=false` för att köra utan Ollama

## 🎯 Production Checklist

- [ ] DATABASE_URL konfigurerad i Vercel
- [ ] Prisma migrations körda
- [ ] ERS_PROFILE satt till rätt profil (SOCIAL för Norge)
- [ ] ERS_BLOCK_THRESHOLD justerad (200 är default)
- [ ] Dashboard testad och tillgänglig
- [ ] API endpoints verifierade
- [ ] Ebrevsmotor pekar på rätt ERS_API_URL
- [ ] Ollama konfigurerad (om deep scan används)
- [ ] Backup-rutin för SecurityAudit-data

## 📞 Support

**Projekt:** Enterprise Research Shield (ERS)
**Skapad:** 20 december 2025
**För:** Norge säkerhetsbolags-möte
**Kontakt:** Mats Hamberg
