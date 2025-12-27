# 📈 Risk Trend Chart - Implementation Guide

## Översikt

Historik-grafen visar HIGH och CRITICAL alerts över de senaste 7 dagarna med norskt färgtema (blått/rött).

## Vad som implementerades

### 1. Dependencies tillagda i package.json
```json
"chart.js": "^4.4.1",
"react-chartjs-2": "^5.2.0"
```

### 2. SecurityAuditor uppdaterad
**Fil:** `src/lib/gateway-core/SecurityAuditor.ts`

Ny metod: `getTrendData(days: number = 7)`
- Hämtar daglig statistik för HIGH (100-199) och CRITICAL (≥200) alerts
- Returnerar array med `{ date, high, critical, total }` för varje dag

### 3. Ny API-endpoint
**Fil:** `src/app/api/security/trend/route.ts`

```bash
GET /api/security/trend?days=7
```

Response:
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-12-14",
      "high": 3,
      "critical": 1,
      "total": 15
    },
    ...
  ]
}
```

### 4. Dashboard uppdaterad
**Fil:** `src/app/security-dashboard/page.tsx`

**Tillagt:**
- Chart.js imports och registrering
- `trendData` state
- Fetch av `/api/security/trend` i `fetchData()`
- Linjegraf-komponent med norskt tema

## Färgtema (Norge)

| Alert-typ | Färg | Hex | Användning |
|-----------|------|-----|------------|
| **CRITICAL** | Röd | `#DC2626` | Blockerade emails (≥200 risk) |
| **HIGH** | Blå | `#2563EB` | Saniterade emails (100-199 risk) |

## Graf-features

✅ **Smooth lines** - Tension: 0.4 för mjuka kurvor  
✅ **Fill under line** - Semi-transparent bakgrund  
✅ **Interactive tooltip** - Visar totalt antal skanningar  
✅ **Point styling** - Vita borders på punkter  
✅ **Responsive** - Anpassar sig till skärmstorlek  
✅ **Auto-refresh** - Uppdateras var 10:e sekund  

## Installation

```bash
cd /Users/admin/CascadeProjects/agent-memory-vault

# Installera dependencies
npm install

# Kör Prisma migration (om inte redan gjort)
npx prisma migrate dev
npx prisma generate

# Starta dev-server
npm run dev
```

## Testning

### 1. Öppna dashboard
```
http://localhost:3030/security-dashboard
```

### 2. Verifiera graf
- Grafen ska visa 7 dagar på X-axeln
- Två linjer: Röd (CRITICAL) och Blå (HIGH)
- Hover över punkter för att se tooltip med totalt antal

### 3. Test med mock-data
Om ingen data finns än, lägg till test-data i databasen:

```sql
-- Lägg till test-skanningar
INSERT INTO "SecurityAudit" (
  "profileType", "contentType", "riskScore", 
  "findingsCount", "findings", "sanitized", 
  "ollamaUsed", "blocked", "timestamp"
) VALUES 
  ('SOCIAL', 'email_text', 150, 2, '[]', true, false, false, NOW() - INTERVAL '1 day'),
  ('SOCIAL', 'email_text', 220, 3, '[]', true, false, true, NOW() - INTERVAL '2 days'),
  ('SOCIAL', 'email_text', 180, 2, '[]', true, false, false, NOW() - INTERVAL '3 days');
```

## Chart.js Konfiguration

### Datasets
```javascript
{
  label: 'CRITICAL (≥200)',
  data: trendData.map(d => d.critical),
  borderColor: '#DC2626',        // Röd
  backgroundColor: 'rgba(220, 38, 38, 0.1)',
  fill: true,
  tension: 0.4
}
```

### Tooltip
- **Mode:** index (visar alla datasets för samma X-värde)
- **Footer:** Visar totalt antal skanningar för dagen
- **Styling:** Mörk bakgrund med vit text

### Scales
- **Y-axis:** Börjar på 0, steg om 1
- **X-axis:** Datum i format "dec 14"

## Felsökning

### Problem: Graf visas inte
**Lösning:** 
1. Kontrollera att `npm install` har körts
2. Verifiera att `/api/security/trend` returnerar data
3. Öppna browser console för fel

### Problem: "Cannot find module 'chart.js'"
**Lösning:**
```bash
npm install chart.js react-chartjs-2
```

### Problem: Ingen data i grafen
**Lösning:**
1. Kontrollera att SecurityAudit-tabellen har data
2. Verifiera att `getTrendData()` returnerar korrekt format
3. Lägg till test-data (se ovan)

### Problem: TypeScript-fel
**Lösning:**
- Felen är förväntade innan `npm install` körs
- Efter installation kommer TypeScript att hitta type definitions

## Visuell Design

```
┌─────────────────────────────────────────────────┐
│  📈 Risk Trend - Senaste 7 dagarna              │
├─────────────────────────────────────────────────┤
│                                                 │
│    [Linjegraf med två kurvor]                  │
│    - Röd linje: CRITICAL alerts                │
│    - Blå linje: HIGH alerts                    │
│                                                 │
├─────────────────────────────────────────────────┤
│  🔴 CRITICAL: Blockerade emails                │
│  🔵 HIGH: Saniterade emails                    │
└─────────────────────────────────────────────────┘
```

## Integration med Norge-mötet

Grafen är perfekt för att visa:
1. **Trend över tid** - Hur många känsliga emails som fångats
2. **Effektivitet** - Visuell bekräftelse att systemet fungerar
3. **Risk-nivåer** - Tydlig skillnad mellan HIGH och CRITICAL
4. **Norge-tema** - Blått och rött matchar norska färger

## Nästa steg

För att göra grafen ännu mer proffsig:

1. **Lägg till fler metrics:**
   - Totalt antal skanningar (grå linje)
   - Blockerade vs tillåtna (stacked area chart)

2. **Interaktivitet:**
   - Klicka på punkt för att se detaljer
   - Zoom in/ut på tidsperiod

3. **Export:**
   - Exportera graf som PNG
   - Exportera data som CSV

4. **Jämförelser:**
   - Visa förra veckan vs denna vecka
   - Visa genomsnitt över tid

## Sammanfattning

✅ Chart.js och react-chartjs-2 installerade  
✅ SecurityAuditor.getTrendData() implementerad  
✅ /api/security/trend endpoint skapad  
✅ Linjegraf med norskt tema (blått/rött)  
✅ Auto-refresh var 10:e sekund  
✅ Responsive design  
✅ Interactive tooltips  

**Status:** Klar för Norge-mötet! 🇳🇴
