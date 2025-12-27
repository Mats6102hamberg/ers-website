# ERS Browser Extension

Professionellt stöd för reflektion och analys.

## Översikt

ERS är en webbläsarextension (Chrome/Edge) som ger användare ett lugnt, professionellt verktyg för reflektion och analys. Extensionen är byggd med fokus på enkelhet, säkerhet och användartillit.

## Funktioner

- **Enkel dialog**: Klicka på ERS-knappen för att öppna en ren dialogruta
- **Flexibel input**: Skriv frågor, resonemang eller text för reflektion
- **Strukturerade svar**: ERS svarar lugnt och genomtänkt
- **Säker kommunikation**: All data går via egen backend (inga nycklar i extensionen)

## Installation

### 1. Installera extensionen i Chrome/Edge

1. Öppna Chrome/Edge
2. Gå till `chrome://extensions/` (eller `edge://extensions/`)
3. Aktivera "Utvecklarläge" (Developer mode)
4. Klicka "Läs in uppackad" (Load unpacked)
5. Välj mappen `ers-browser-extension`

### 2. Lägg till ikoner (valfritt)

Extensionen behöver ikoner för att visas korrekt:
- Placera `icon16.png`, `icon48.png`, `icon128.png` i mappen `icons/`
- Rekommenderad design: Minimalistisk, lila/blå gradient

### 3. Starta backend-tjänsten

```bash
cd ers-backend
npm install
npm start
```

Backend körs nu på `http://localhost:3030`

## Användning

1. Klicka på ERS-ikonen i webbläsaren
2. Skriv din fråga, ditt resonemang eller text för reflektion
3. Klicka "Skicka" eller tryck Enter
4. ERS svarar strukturerat och lugnt

## Teknisk arkitektur

```
Browser Extension (Manifest v3)
    ↓
Backend (Express.js på localhost:3030)
    ↓
[Extern beräkningshjälp - valfritt]
```

### Säkerhet

- Inga API-nycklar i extensionen
- All kommunikation via egen backend
- Inga särskilda webbläsarbehörigheter krävs
- Lokal körning (localhost:3030)

## Utveckling

### Projektstruktur

```
ers-browser-extension/
├── manifest.json       # Extension-konfiguration
├── popup.html          # UI-struktur
├── popup.css           # Minimalistisk design
├── popup.js            # Logik och kommunikation
└── icons/              # Ikoner (16, 48, 128 px)

ers-backend/
├── server.js           # Express.js backend
├── package.json        # Dependencies
└── .env.example        # Konfiguration
```

### Designprinciper

- **Minimalism**: Inget brus, tydlig text
- **Professionalism**: Lugn, eftertänksam känsla
- **Tillit**: Genomtänkt design som skapar förtroende

### UX-principer

ERS ska upplevas som:
- Trygg
- Eftertänksam
- Professionell
- Verksamhetsnära (inte teknisk eller "AI-ig")

## Produktion

För produktion behöver du:

1. **Extern beräkningshjälp**: Integrera med OpenAI, Anthropic eller liknande
2. **Säker backend**: Deploya backend till säker miljö (inte localhost)
3. **Uppdatera manifest.json**: Ändra `host_permissions` till produktions-URL
4. **Professionella ikoner**: Ersätt placeholder-ikoner

## Support

För frågor eller support, kontakta systemansvarig.

---

**Version**: 1.0.0  
**Status**: Funktionell prototyp  
**Licens**: Intern användning
