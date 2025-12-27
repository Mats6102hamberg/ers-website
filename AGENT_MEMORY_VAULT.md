# AGENT MEMORY VAULT

This document serves as the central knowledge base for all Smartflow AB projects and architectural decisions.

---

## 🔮 FUTURE COMMERCIAL ARCHITECTURE (The 'Self-Driving' Model)

Denna strategi gäller för kommande B2B-system (t.ex. ERS/Vitalmonitor):

**Målgrupp:** IT-avdelningar som inte är experter på vår kod.

**Unik Säljpunkt (USP):** 'Zero Maintenance for Client'.

**Systemet har en inbyggd Gemini Support Agent.**

**Agenten agerar tolk:** Personalen felanmäler på vanlig svenska → Agenten översätter till teknisk diagnos.

### Säkerhet & Drift:

- **Crash Catcher:** Automatiska larm går direkt till Mats mobil (Realtid).
- **Kill Switch:** AI-vakten kan låsa systemet autonomt vid misstänkt beteende.
- **VIP Backdoor:** En dedikerad kanal där Mats kan chatta direkt med systemets AI för djupanalys utan att störa kunden.

**Affärsvärde:** Kunden köper en 'levande' tjänst som sköter sig själv, vilket sänker tröskeln för köpbeslut drastiskt.

---

## 🛡️ ERS CHROME EXTENSION - AI-BASERAT DOKUMENTSTÖD

**Status:** ✅ Produktionsklar demo (December 2025)

### Översikt

ERS (Enterprise Research Shield) är ett Chrome-tillägg som ger användare tillgång till ett professionellt AI-baserat dokumentstöd direkt i webbläsaren.

**Arkitektur:**
```
Chrome Extension (popup)
    ↓ HTTP POST
Backend (Express.js localhost:3030)
    ↓ API call
OpenAI GPT-4o-mini
    ↓ Response
User får professionellt svar
```

### Komponenter

#### 1. Backend (`ers-backend/`)
- **Teknik:** Express.js + OpenAI SDK
- **Port:** 3030
- **AI-modell:** GPT-4o-mini (OpenAI)
- **Språk:** Svenska
- **Systemprompt:** Allmänt hållen, professionell - stöd för resonemang och analys

**Starta backend:**
```bash
cd ers-backend
npm install
npm start
```

#### 2. Chrome Extension (`ers-browser-extension/`)
- **Manifest:** V3 (modern standard)
- **UI:** Popup med minimalistisk lila/blå design
- **Ikoner:** 16x16, 48x48, 128x128 px (Python-genererade)
- **Kommunikation:** Fetch API till localhost:3030

**Ladda tillägget:**
```
1. chrome://extensions/
2. Developer mode ON
3. Load unpacked → ers-browser-extension/
```

### ERS:s Profil

**Syfte:** Stöd för resonemang, analys och struktur i textbaserat arbete.

**Hjälper till med:**
- Tydliggöra tankar och strukturera resonemang
- Identifiera perspektiv och belysa konsekvenser
- Upptäcka risker, oklarheter eller antaganden
- Stöd inför beslut, formuleringar eller bedömningar

**Användningsområden:**
- 🏥 Vård: Journalföring, vårdplaner, dokumentation
- ⚖️ Juridik: Avtal, beslutsunderlag
- 💼 Affär: Strategiska beslut, planering
- 📋 Dokumentation: Rapporter, kommunikation
- 🤔 Reflektion: Analys av komplexa situationer

**Designprinciper:**
- Lugn, professionell ton (aldrig "AI-aktig")
- Respektfull för användarens kompetens
- Icke-styrande - stödjer tänkande, ger inte färdiga svar
- Tydlig avgränsning när frågor ligger utanför fokus
- Anpassar språk efter sammanhang

### Användningsupplevelse

**Slutanvändaren:**
1. Klickar på ERS-ikon i Chrome
2. Skriver fråga eller text för reflektion
3. Klickar "Skicka" (eller Enter)
4. Får professionellt, strukturerat svar på svenska

**Kostnad:** ~0,01-0,03 kr/fråga (GPT-4o-mini)

### Säkerhet

- ✅ Lokal backend (localhost:3030)
- ✅ Krypterad kommunikation med OpenAI
- ✅ Ingen data sparas lokalt
- ✅ API-nyckel i .env (gitignored)
- ✅ Inga känsliga data ska användas i demo

### Dokumentation

- **ERS_SNABBSTART.md** - Komplett användarguide
- **ers-browser-extension/README.md** - Extension-installation
- **ers-backend/server.js** - Backend-implementation med kommentarer

### Framtida Utveckling

**Produktion:**
- Deploy backend till säker server (inte localhost)
- Eventuell verksamhetsanpassad systemprompt
- Lokal AI-option (Ollama) för extra integritet
- Publicera till Chrome Web Store

**Integration:**
- Koppla till ERS säkerhetsskanning (agent-memory-vault)
- Kombinera dokumentstöd med säkerhetskontroll
- Unified ERS-plattform: Säkerhet + Dokumentstöd
