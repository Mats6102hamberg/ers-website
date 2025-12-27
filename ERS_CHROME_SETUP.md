# 🛡️ ERS Chrome Extension - Komplett Setup Guide

**Enterprise Research Shield** med Chrome-tillägg för säker textscanning.

## 🎯 Översikt

ERS består nu av två komponenter:

1. **Backend** (Next.js på port 3030) - Säkerhetsscanningsmotorn
2. **Chrome Extension** - Användarvänligt popup-gränssnitt

---

## ⚡ Snabbstart (3 minuter)

### Steg 1: Starta Backend

```bash
cd /Users/admin/CascadeProjects/agent-memory-vault
npm run dev
```

**Resultat:** Backend startar på `http://localhost:3030`

### Steg 2: Installera Chrome-tillägget

1. Öppna Chrome och gå till: `chrome://extensions/`
2. Aktivera **"Developer mode"** (övre högra hörnet)
3. Klicka **"Load unpacked"**
4. Välj mappen:
   ```
   /Users/admin/CascadeProjects/agent-memory-vault/chrome-extension
   ```
5. Klicka **"Select"**

### Steg 3: Testa systemet

1. Klicka på 🛡️-ikonen i Chrome-verktygsfältet
2. Klistra in testtext:
   ```
   Fødselsnummer: 010190-12345
   Saksnummer: SAK-2024/12345
   ```
3. Klicka **"🔍 Scanna text"**
4. Du bör se **röd varning** om kritisk risk

---

## ✅ Verifiering av Installation

### Backend-kontroll

```bash
# Test 1: API tillgängligt?
curl http://localhost:3030/api/security/stats?timeRange=day

# Förväntat resultat: JSON med statistik
{"success":true,"data":{...}}

# Test 2: Scanna testinnehåll
curl -X POST http://localhost:3030/api/security/scan \
  -H "Content-Type: application/json" \
  -d '{"content":"010190-12345","profileType":"SOCIAL","contentType":"manual_scan"}'

# Förväntat resultat: Blockerad med hög riskscore
{"allowed":false,"riskScore":200,...}
```

### Chrome Extension-kontroll

1. Gå till `chrome://extensions/`
2. Hitta **Enterprise Research Shield**
3. Kontrollera:
   - ✅ Ingen röd/gul varningstext
   - ✅ Sköld-ikon syns
   - ✅ Status: "Enabled"

4. Klicka på tilläggsikonen:
   - ✅ Popup öppnas
   - ✅ Textfält och knapp syns
   - ✅ Tre säkerhetsprofiler i dropdown

---

## 🔧 Tekniska Förändringar

### Port-migration: 3000 → 3030

**Ändrade filer:**
- `.env` - `NEXT_PUBLIC_DASHBOARD_URL="http://localhost:3030"`
- `.env.example` - Samma ändring
- `package.json` - `"dev": "next dev --turbopack -p 3030"`
- `package.json` - `"start": "next start -p 3030"`
- Alla `*.md`-filer - localhost:3000 → localhost:3030

**Varför port 3030?**
- Konsistens med din ursprungliga specifikation
- Undviker konflikt med andra Next.js-projekt på 3000
- Tydlig separation från standard-portar

### Chrome Extension-struktur

```
chrome-extension/
├── manifest.json          # Manifest V3 (modern standard)
├── popup.html             # UI med blå gradient ERS-design
├── popup.js               # API-kommunikation med fetch()
├── README.md              # Detaljerad användarguide
└── icons/
    ├── icon-16.png        # Toolbar-ikon
    ├── icon-48.png        # Extensions-lista
    └── icon-128.png       # Chrome Web Store-ready
```

---

## 🎨 UI/UX-detaljer

### Färgschema (ERS Brand)

- **Primary:** Blå gradient (#1e3a8a → #312e81)
- **Success:** Grön (#10b981)
- **Warning:** Gul (#fbbf24)
- **Danger:** Röd (#ef4444)

### Popup-funktioner

1. **Tre säkerhetsprofiler:**
   - SOCIAL (Norge-fokus)
   - MEDICAL (Vård)
   - ENTERPRISE (Företag)

2. **Risknivåer:**
   - 🟢 0-49: Säkert (grön)
   - 🟡 50-99: Måttlig risk (gul)
   - 🟠 100-199: Hög risk (orange)
   - 🔴 200+: Kritisk/Blockerad (röd)

3. **Resultatvisning:**
   - Tydlig färgkodning
   - Lista med alla upptäckta hot
   - Severity-badges (CRITICAL, HIGH, MEDIUM, LOW)
   - Saniterad version (om tillgänglig)

---

## 🛠️ Felsökning

### Problem: "Kunde inte ansluta till backend"

**Orsak:** Backend körs inte

**Lösning:**
```bash
# Kontrollera om backend körs
lsof -i :3030

# Om inga resultat, starta backend
npm run dev
```

### Problem: Port 3030 redan använd

**Orsak:** Gammal process kör fortfarande

**Lösning:**
```bash
# Hitta process
lsof -i :3030

# Döda process (ersätt PID)
kill <PID>

# Starta ny instans
npm run dev
```

### Problem: Tillägget visar fel version

**Orsak:** Chrome cache

**Lösning:**
1. `chrome://extensions/`
2. Hitta ERS
3. Klicka **🔄 Reload**

### Problem: CORS-fel i konsolen

**Orsak:** Manifest saknar host_permissions

**Lösning:**
- Kontrollera att `manifest.json` innehåller:
  ```json
  "host_permissions": [
    "http://localhost:3030/*"
  ]
  ```
- Ladda om tillägget

---

## 🔒 Säkerhetsarkitektur

### Dataintegritet

- ✅ **100% lokal processing** - Inget lämnar din dator
- ✅ **Ingen telemetri** - Ingen analytics eller tracking
- ✅ **Ingen internetanslutning krävs** (förutom för AI-analys om aktiverad)
- ✅ **Öppen källkod** - Granska själv

### API-säkerhet

- Backend kör på localhost (inte exponerad)
- Chrome Extension kan endast ansluta till localhost:3030
- Ingen autentisering krävs (lokal användning)

---

## 📊 API-endpoints

### Scanning

```bash
POST /api/security/scan
Content-Type: application/json

{
  "content": "Text att scanna",
  "profileType": "SOCIAL|MEDICAL|ENTERPRISE",
  "contentType": "manual_scan",
  "recipientEmail": "chrome-extension@ers.local"
}
```

**Response:**
```json
{
  "allowed": true|false,
  "riskScore": 0-200+,
  "findings": [...],
  "sanitizedContent": "...",
  "timestamp": "..."
}
```

### Statistik

```bash
GET /api/security/stats?timeRange=day|week|month
```

### Varningar

```bash
GET /api/security/alerts?limit=10
```

---

## 🚀 Nästa Steg

### För utveckling

1. **AI-analys:** Aktivera Ollama för djupare scanning
   ```bash
   # Se AI_COUNCIL_GUIDE.md för setup
   ollama pull qwen2.5:7b
   ollama pull llama3.1:8b
   ```

2. **Email-alerts:** Konfigurera Resend för notifieringar
   ```bash
   # Se EMAIL_ALERTS_GUIDE.md
   ```

3. **Dashboard:** Öppna live-dashboard
   ```
   http://localhost:3030/security-dashboard
   ```

### För produktion

1. **Backend:** Deploy till Vercel
   ```bash
   vercel --prod
   ```

2. **Extension:** Publicera till Chrome Web Store
   - Kräver utvecklarkonto ($5 engångsavgift)
   - Se: https://developer.chrome.com/docs/webstore/publish

---

## 📝 Användningsexempel

### Scenario 1: Email-draft kontroll

1. Skriv email i Gmail/Outlook
2. Kopiera texten (Ctrl+C)
3. Öppna ERS-tillägget
4. Klistra in (Ctrl+V)
5. Välj profil: **SOCIAL**
6. Scanna
7. Granska resultat
8. Om säkert: Skicka email
9. Om osäkert: Redigera och scanna igen

### Scenario 2: Dokumentgranskning

1. Öppna PDF/Word-dokument
2. Kopiera text som ska delas
3. Öppna ERS-tillägget
4. Välj profil: **ENTERPRISE**
5. Scanna
6. Granska saniterad version
7. Använd saniterad text istället

### Scenario 3: Chat-meddelande

1. Skriv meddelande i Slack/Teams
2. Före sändning: Kopiera text
3. Öppna ERS-tillägget
4. Välj profil: **MEDICAL** (om vård)
5. Scanna
6. Om blockerad: Omformulera
7. Om säker: Skicka meddelande

---

## 🎓 Utbildning & Onboarding

### För slutanvändare

1. **Demo med testdata:**
   ```
   Fødselsnummer: 010190-12345
   Saksnummer: SAK-2024/12345
   API-nyckel: sk-proj-abc123def456
   ```

2. **Förklara risknivåer:**
   - Grön = OK att dela
   - Gul = Granska extra noga
   - Orange = Sanitera först
   - Röd = ALDRIG dela

3. **Vanliga misstag:**
   - Kopiera personnummer från testmiljöer
   - Dela API-nycklar i Slack
   - Email med saksnummer i ämnesrad

### För administratörer

1. **Backend-drift:**
   - Håll backend uppdaterad (`git pull`)
   - Övervaka dashboard för statistik
   - Granska alerts regelbundet

2. **Profil-anpassning:**
   - Redigera `src/lib/gateway-core/SecurityProfile.ts`
   - Lägg till organisation-specifika mönster
   - Justera risk-scores

---

## 📞 Support

**Projektsökväg:**
```
/Users/admin/CascadeProjects/agent-memory-vault
```

**Backend URL:** http://localhost:3030

**Chrome Extension:** `chrome://extensions/` → Enterprise Research Shield

**Dokumentation:**
- `ERS_README.md` - Backend-guide
- `chrome-extension/README.md` - Extension-guide
- `AI_COUNCIL_GUIDE.md` - AI-setup
- `EMAIL_ALERTS_GUIDE.md` - Email-notifieringar

---

**Utvecklad av:** Smartflow AB
**Version:** 1.0.0
**Datum:** December 2025
**För:** Norge säkerhetsbolags-möte
