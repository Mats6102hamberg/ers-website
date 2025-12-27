# 🌍 Multi-språk Support - Local Adaptation för Norge

## Översikt

Språkväljaren i dashboarden visar "Local Adaptation" - systemet kan anpassas till norska termer och begrepp. Detta är en viktig funktion för det norska säkerhetsbolaget som visar att ERS är flexibelt och kan anpassas till lokala marknader.

## Vad som implementerades

### 1. Translations-fil
**Fil:** `src/lib/translations.ts`

**Språk som stöds:**
- 🇸🇪 **Svenska (sv)** - Standard
- 🇳🇴 **Norska (no)** - Norge-anpassad

**Översatta termer (60+ stycken):**
- Header (titel, knappar, dropdown)
- Metrics (skanningar, blockerade, risk)
- Chart (risk-trend, kritisk, hög)
- Profiler, varningar, fynd
- Footer (Norge-mönster, Ollama status)

### 2. Språkväljare i Dashboard
**Placering:** Header-sektion, till vänster om Export-knapp

**Design:**
- 🇸🇪 **Svenska** - Blå knapp när aktiv
- 🇳🇴 **Norska** - Röd knapp när aktiv
- Flagg-emojis för tydlighet
- Hover-effekt på inaktiv knapp
- Smooth transition mellan språk

### 3. Uppdaterade komponenter
**Fil:** `src/app/security-dashboard/page.tsx`

**Alla sektioner översatta:**
- Header (titel, knappar, dropdown)
- Key Metrics (4 kort)
- Risk Trend Chart (titel, legend)
- Profiler (rubrik, etiketter)
- Senaste varningar (rubrik, meddelanden)
- Högsta riskfynd (tabell-headers)
- Footer (Norge-mönster, Ollama status)

## Språkjämförelse

### Svenska → Norska översättning

| Svenska | Norska | Kontext |
|---------|--------|---------|
| Säkerhetsstatistikk | Sikkerhetsstatistikk | Header |
| Totala skanningar | Totale skanninger | Metrics |
| Blockerade | Blokkerte | Metrics |
| Genomsnittlig risk | Gjennomsnittlig risiko | Metrics |
| Senaste timmen | Siste timen | Dropdown |
| Senaste dygnet | Siste døgnet | Dropdown |
| Senaste veckan | Siste uken | Dropdown |
| Risk Trend - Senaste 7 dagarna | Risiko-trend - Siste 7 dagene | Chart |
| CRITICAL: Blockerade emails | KRITISK: Blokkerte e-poster | Chart legend |
| HIGH: Saniterade emails | HØY: Sanerte e-poster | Chart legend |
| Profiler | Profiler | Section |
| Senaste varningar | Siste varsler | Section |
| Inga varningar ännu | Ingen varsler ennå | Empty state |
| Högsta riskfynd | Høyeste risikofunn | Section |
| Personnummer | **Fødselsnummer** | Pattern (Norge-specifikt!) |
| Ärendenummer | **Saksnummer** | Pattern (Norge-specifikt!) |

### Norge-specifika termer

**Viktiga skillnader:**
- 🇸🇪 **Personnummer** → 🇳🇴 **Fødselsnummer**
- 🇸🇪 **Ärendenummer** → 🇳🇴 **Saksnummer**
- 🇸🇪 **NAV-beslut** → 🇳🇴 **NAV-vedtak**

## Användning

### För användare:

1. **Öppna dashboard:** `http://localhost:3030/security-dashboard`
2. **Klicka på språkväljare** i header (🇸🇪 Svenska / 🇳🇴 Norsk)
3. **Alla etiketter uppdateras** omedelbart
4. **Språkvalet sparas** i komponenten (persists under session)

### För utvecklare:

```typescript
// Lägg till ny översättning i translations.ts
export const translations = {
  sv: {
    newKey: 'Svensk text'
  },
  no: {
    newKey: 'Norsk tekst'
  }
};

// Använd i komponenten
const t = (key: string) => translations[language][key];

// I JSX
<h1>{t('newKey')}</h1>
```

## Norge-mötet Demo

### Scenario 1: Visa Local Adaptation
```
"Som ni ser här har vi en språkväljare. Detta visar att systemet
kan anpassas till lokala marknader. När jag klickar på Norsk..."

[Klicka på 🇳🇴 Norsk]

"...så uppdateras alla termer till norska begrepp. Lägg märke till
att 'Personnummer' nu heter 'Fødselsnummer', och 'Ärendenummer'
är nu 'Saksnummer'. Detta är exakt de termer som används i Norge."
```

### Scenario 2: Norge-specifika mönster
```
"I footer ser ni att systemet har Norge-specifika mönster aktiva:
Fødselsnummer, Saksnummer, NAV-vedtak. Detta är inte bara en
översättning - systemet är verkligen anpassat för norska regler."
```

### Scenario 3: Flexibilitet
```
"Detta visar att ERS är flexibelt och kan anpassas till olika
marknader. Om ni vill ha systemet på norska, danska, finska -
det är bara att lägga till översättningar. Arkitekturen är
redan på plats."
```

## Teknisk implementation

### State management:
```typescript
const [language, setLanguage] = useState<Language>('sv');
```

### Translation helper:
```typescript
const t = (key: string) => translations[language][key as keyof typeof translations['sv']] || key;
```

### Språkväljare:
```tsx
<div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg p-1 shadow-sm">
  <button
    onClick={() => setLanguage('sv')}
    className={language === 'sv' ? 'bg-blue-600 text-white' : 'text-gray-700'}
  >
    🇸🇪 Svenska
  </button>
  <button
    onClick={() => setLanguage('no')}
    className={language === 'no' ? 'bg-red-600 text-white' : 'text-gray-700'}
  >
    🇳🇴 Norsk
  </button>
</div>
```

## Framtida utökningar

### Fler språk:
1. **🇩🇰 Danska** - För danska marknaden
2. **🇫🇮 Finska** - För finska marknaden
3. **🇬🇧 Engelska** - För internationella kunder

### Persistent språkval:
```typescript
// Spara i localStorage
useEffect(() => {
  localStorage.setItem('ers-language', language);
}, [language]);

// Ladda från localStorage
useEffect(() => {
  const saved = localStorage.getItem('ers-language');
  if (saved) setLanguage(saved as Language);
}, []);
```

### Backend-integration:
```typescript
// Spara språkval i användarens profil
await fetch('/api/user/preferences', {
  method: 'POST',
  body: JSON.stringify({ language })
});
```

## Fördelar för Norge-mötet

### 1. Local Adaptation
Visar att ERS inte är "one-size-fits-all" utan kan anpassas till lokala marknader.

### 2. Norge-fokus
Användning av norska termer (Fødselsnummer, Saksnummer) visar att systemet är byggt för Norge.

### 3. Professionalism
Språkväljare med flaggor och smooth transitions ger ett polerat intryck.

### 4. Flexibilitet
Visar att systemet kan skalas till andra nordiska länder (Danmark, Finland).

### 5. User Experience
Användare kan välja sitt föredragna språk - viktigt för adoption.

## Testning

### Test 1: Byt språk
```
1. Öppna dashboard
2. Klicka på 🇳🇴 Norsk
3. Verifiera att alla etiketter uppdateras
4. Klicka på 🇸🇪 Svenska
5. Verifiera att allt är tillbaka till svenska
```

### Test 2: Verifiera Norge-termer
```
1. Byt till Norsk
2. Kontrollera att "Personnummer" → "Fødselsnummer"
3. Kontrollera att "Ärendenummer" → "Saksnummer"
4. Kontrollera footer: "NAV-vedtak" (inte "NAV-beslut")
```

### Test 3: Alla sektioner
```
1. Byt till Norsk
2. Scrolla genom hela dashboarden
3. Verifiera att ALLA sektioner är översatta:
   - Header
   - Metrics (4 kort)
   - Chart (titel + legend)
   - Profiler
   - Varningar
   - Fynd-tabell
   - Footer
```

## Felsökning

### Problem: Vissa termer inte översatta
**Lösning:** Kontrollera att nyckeln finns i `translations.ts` för båda språken

### Problem: Språkväljare syns inte
**Lösning:** Kontrollera att `Language` type är importerad från `@/lib/translations`

### Problem: Fel färg på aktiv knapp
**Lösning:** Verifiera conditional className: `language === 'sv' ? 'bg-blue-600' : '...'`

## Sammanfattning

✅ **Språkväljare** med 🇸🇪 Svenska / 🇳🇴 Norsk  
✅ **60+ översatta termer** i translations.ts  
✅ **Norge-specifika termer** (Fødselsnummer, Saksnummer, NAV-vedtak)  
✅ **Alla sektioner översatta** (header, metrics, chart, profiler, varningar, fynd, footer)  
✅ **Smooth transitions** mellan språk  
✅ **Flagg-emojis** för tydlighet  
✅ **Färgkodning** (blå för Svenska, röd för Norska)  
✅ **Local Adaptation** - visar flexibilitet och anpassning  

**Status:** Klar för Norge-mötet! 🇳🇴

---

**Multi-språk support visar att ERS är ett flexibelt system som kan anpassas till lokala marknader!**
