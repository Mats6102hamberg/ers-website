# 🛡️ Enterprise Research Shield - Chrome Extension

Chrome-tillägg för säkerhetsscanning av känslig information innan delning.

## 📋 Förutsättningar

1. **Backend måste köras lokalt:**
   ```bash
   cd /Users/admin/CascadeProjects/agent-memory-vault
   npm run dev
   ```
   Backend startar på: `http://localhost:3030`

2. **Chrome-webbläsare** (eller Chromium-baserad webbläsare som Edge, Brave, etc.)

## 🚀 Installation

### Steg 1: Öppna Chrome Extensions

1. Öppna Chrome
2. Navigera till: `chrome://extensions/`
3. Aktivera **"Developer mode"** (Utvecklarläge) i övre högra hörnet

### Steg 2: Ladda tillägget

1. Klicka på **"Load unpacked"** (Läs in opaketerat tillägg)
2. Navigera till mappen:
   ```
   /Users/admin/CascadeProjects/agent-memory-vault/chrome-extension
   ```
3. Klicka **"Select"** (Välj)

### Steg 3: Verifiera installation

✅ Tillägget ska nu synas i listan med ett sköld-ikon
✅ Ingen röd/gul varningstext ska visas
✅ Klicka på sköld-ikonen i Chrome-verktygsfältet för att öppna popup

## 💻 Användning

### Grundläggande scanning

1. **Klicka** på tilläggsikonen i Chrome-verktygsfältet
2. **Välj** säkerhetsprofil:
   - **SOCIAL** - För socialtjänst, NAV, kommuner (rekommenderad)
   - **MEDICAL** - För vård och medicinska system
   - **ENTERPRISE** - För företag och organisationer

3. **Klistra in** text du vill scanna i textfältet
4. **Klicka** på "🔍 Scanna text"
5. **Granska** resultatet:
   - ✅ **Grön** = Säkert innehåll
   - ⚡ **Gul** = Måttlig risk (granska innan delning)
   - ⚠️ **Orange** = Hög risk (känslig information hittad)
   - 🚫 **Röd** = Kritisk risk (innehåll blockerat)

### Tangentbordsgenväg

- **Ctrl + Enter** i textfältet = Starta scanning

## 🔧 Säkerhetsprofiler

### SOCIAL (Norge-fokus)
Scannar efter:
- Fødselsnummer (NO)
- Personnummer (SE)
- Saksnummer
- NAV-beslut
- Kontonummer

### MEDICAL
Scannar efter:
- Journalnummer
- Diagnoskoder
- Receptnummer
- Personnummer
- Medicinska termer

### ENTERPRISE
Scannar efter:
- API-nycklar
- Email-adresser
- Telefonnummer
- Organisationsnummer
- Kreditkort

## 📊 Risk Scoring

| Risk Score | Nivå | Färg | Åtgärd |
|------------|------|------|--------|
| 0-49 | LÅG | 🟢 Grön | Tillåt |
| 50-99 | MÅTTLIG | 🟡 Gul | Granska |
| 100-199 | HÖG | 🟠 Orange | Sanitera |
| 200+ | KRITISK | 🔴 Röd | **BLOCKERA** |

## 🛠️ Felsökning

### Tillägget visar "Kunde inte ansluta till backend"

**Problem:** Backend körs inte på port 3030

**Lösning:**
```bash
# Kontrollera att backend körs
curl http://localhost:3030/api/security/stats?timeRange=day

# Om inte, starta backend
cd /Users/admin/CascadeProjects/agent-memory-vault
npm run dev
```

### Tillägget laddas inte i Chrome

**Problem:** Manifest-fel eller saknade filer

**Lösning:**
1. Gå till `chrome://extensions/`
2. Klicka på **"Reload"** på ERS-tillägget
3. Kontrollera att alla filer finns:
   ```
   chrome-extension/
   ├── manifest.json
   ├── popup.html
   ├── popup.js
   ├── README.md
   └── icons/
       ├── icon-16.png
       ├── icon-48.png
       └── icon-128.png
   ```

### API-anrop misslyckas med CORS-fel

**Problem:** Chrome blockerar anrop till localhost

**Lösning:**
- Tillägget har redan `host_permissions` för `http://localhost:3030/*` i manifest.json
- Om problemet kvarstår, ladda om tillägget

### Tillägget visar fel ikoner eller gammal data

**Problem:** Cache-problem

**Lösning:**
1. Gå till `chrome://extensions/`
2. Klicka **"Remove"** på ERS-tillägget
3. Ladda om tillägget via **"Load unpacked"**

## 🔄 Uppdatering

När tilläggets kod uppdateras:

1. Gå till `chrome://extensions/`
2. Hitta **Enterprise Research Shield**
3. Klicka på **🔄 Reload** (uppdatera-ikonen)

Alternativt:
```bash
# I Chrome DevTools (F12) när popup är öppen
# Högerklicka på popup → Reload
```

## 📂 Filstruktur

```
chrome-extension/
├── manifest.json          # Chrome extension manifest (Manifest V3)
├── popup.html             # Popup UI med styling
├── popup.js               # JavaScript för API-kommunikation
├── README.md              # Denna fil
└── icons/
    ├── icon-16.png        # Toolbar-ikon (16x16)
    ├── icon-48.png        # Extensions-sida (48x48)
    └── icon-128.png       # Chrome Web Store (128x128)
```

## 🎯 API-endpoints (Backend)

Tillägget kommunicerar med:

- **POST** `/api/security/scan` - Scanna innehåll
- **GET** `/api/security/stats?timeRange=day` - Hämta statistik
- **GET** `/api/security/alerts?limit=10` - Hämta varningar

## 🔒 Säkerhet & Integritet

- ✅ Allt körs **lokalt** på din dator
- ✅ **Ingen data** lämnar din maskin
- ✅ **Ingen telemetri** eller analytics
- ✅ **Öppen källkod** - granska koden själv
- ✅ Backend kräver **ingen internetanslutning** (förutom för AI-analys om aktiverad)

## 📞 Support

**Backend körs inte automatiskt** - Du måste starta den manuellt:
```bash
npm run dev
```

**Backend-URL:** `http://localhost:3030`

**Projektsökväg:** `/Users/admin/CascadeProjects/agent-memory-vault`

---

**Utvecklad av:** Smartflow AB
**Version:** 1.0.0
**Skapad:** December 2025
