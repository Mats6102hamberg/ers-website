# 📥 CSV Export Feature - Säkerhetschefernas Favorit

## Översikt

Export-funktionen låter säkerhetschefer ladda ner alla audit-loggar som CSV-fil för analys, rapportering och compliance.

## Vad som implementerades

### 1. API Endpoint
**Fil:** `src/app/api/security/export/route.ts`

```bash
GET /api/security/export?timeRange=day&profileType=SOCIAL
```

**Query Parameters:**
- `timeRange` (optional): `hour`, `day`, `week`, `month`, `all` (default: `all`)
- `profileType` (optional): `MEDICAL`, `SOCIAL`, `ENTERPRISE`, `all` (default: `all`)

**Response:**
- Content-Type: `text/csv; charset=utf-8`
- Filename: `security-audit-YYYY-MM-DD.csv`
- Automatisk nedladdning i webbläsare

### 2. Export-knapp i Dashboard
**Fil:** `src/app/security-dashboard/page.tsx`

**Placering:** Header-sektion, till vänster om Auto-refresh checkbox

**Design:**
- Grön knapp (`bg-green-600`) för tydlig call-to-action
- Nedladdningsikon (SVG) från Heroicons
- Text: "Exportera Audit-logg (CSV)"
- Hover-effekt: Mörkare grön (`bg-green-700`)
- Shadow för djup

## CSV-format

### Kolumner:
1. **Timestamp** - ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
2. **Profile Type** - MEDICAL, SOCIAL, ENTERPRISE
3. **Content Type** - email_subject, email_html, email_text, etc.
4. **Risk Score** - Numeriskt värde (0-∞)
5. **Findings Count** - Antal fynd
6. **Sanitized** - Yes/No
7. **Ollama Used** - Yes/No
8. **Campaign ID** - Kampanj-ID (om tillämpligt)
9. **Recipient Email** - Mottagarens email (om tillämpligt)
10. **Blocked** - Yes/No
11. **Findings** - Detaljerad lista av fynd (pattern: severity)

### Exempel CSV:
```csv
Timestamp,Profile Type,Content Type,Risk Score,Findings Count,Sanitized,Ollama Used,Campaign ID,Recipient Email,Blocked,Findings
2025-12-20T06:30:15.123Z,SOCIAL,email_text,150,2,Yes,No,camp_123,user@example.com,No,"Norwegian Fødselsnummer: CRITICAL; Saksnummer: HIGH"
2025-12-20T06:25:10.456Z,SOCIAL,email_subject,220,3,Yes,No,camp_123,admin@example.com,Yes,"Norwegian Fødselsnummer: CRITICAL; Personnummer (SE): CRITICAL; Bank Account Number: MEDIUM"
```

## Användning

### För säkerhetschefer:

1. **Öppna dashboard:** `http://localhost:3030/security-dashboard`
2. **Välj tidsperiod:** Dropdown (timme/dag/vecka/månad)
3. **Klicka på "Exportera Audit-logg (CSV)"**
4. **CSV-fil laddas ner automatiskt**
5. **Öppna i Excel/Google Sheets** för analys

### Filtrering:

**Efter tidsperiod:**
```bash
# Senaste dygnet
GET /api/security/export?timeRange=day

# Senaste veckan
GET /api/security/export?timeRange=week

# Alla loggar
GET /api/security/export?timeRange=all
```

**Efter profil:**
```bash
# Endast SOCIAL-profilen (Norge-mötet)
GET /api/security/export?profileType=SOCIAL

# Endast MEDICAL
GET /api/security/export?profileType=MEDICAL
```

**Kombinerat:**
```bash
# SOCIAL-loggar från senaste veckan
GET /api/security/export?timeRange=week&profileType=SOCIAL
```

## Teknisk implementation

### CSV-konvertering:
```typescript
function convertToCSV(data: any[]): string {
  // Headers
  const headers = ['Timestamp', 'Profile Type', ...];
  
  // Rows med escaped quotes
  const rows = data.map(log => {
    const findings = Array.isArray(log.findings) 
      ? log.findings.map(f => `${f.pattern}: ${f.severity}`).join('; ')
      : JSON.stringify(log.findings);
    
    return [
      new Date(log.timestamp).toISOString(),
      log.profileType,
      // ... andra fält
      `"${findings.replace(/"/g, '""')}"` // Escape quotes
    ].join(',');
  });
  
  return [headers.join(','), ...rows].join('\n');
}
```

### Prisma Query:
```typescript
const auditLogs = await prisma.securityAudit.findMany({
  where: {
    timestamp: { gte: startDate },
    profileType: 'SOCIAL'
  },
  orderBy: { timestamp: 'desc' }
});
```

## Användningsfall för Norge-mötet

### 1. Compliance-rapportering
**Scenario:** Säkerhetschefen behöver visa att alla känsliga data har loggats och hanterats korrekt.

**Lösning:**
- Exportera alla loggar för senaste månaden
- Visa att CRITICAL alerts har blockerats
- Visa att HIGH alerts har saniterats

### 2. Incident-analys
**Scenario:** En känslig email har läckt, behöver spåra vad som hände.

**Lösning:**
- Filtrera på specifik tidsperiod
- Sök efter campaign_id eller recipient_email i CSV
- Analysera findings för att se vad som missades

### 3. Trend-analys
**Scenario:** Behöver visa hur många norska personnummer som fångats över tid.

**Lösning:**
- Exportera alla SOCIAL-loggar
- Öppna i Excel
- Skapa pivot-tabell på findings-kolumnen
- Räkna "Norwegian Fødselsnummer" förekomster

### 4. Audit Trail
**Scenario:** Behöver bevisa att systemet fungerar för certifiering.

**Lösning:**
- Exportera alla loggar
- Visa att varje scanning har timestamp
- Visa att blocked emails aldrig skickades
- Visa att sanitized emails har maskerade värden

## Excel-analys Tips

### Pivot-tabell för fynd-typer:
1. Öppna CSV i Excel
2. Välj "Insert" → "PivotTable"
3. Dra "Findings" till Rows
4. Dra "Findings Count" till Values (Count)
5. Se vilka mönster som triggar mest

### Filter för CRITICAL alerts:
1. Klicka på "Risk Score" header
2. Välj "Filter"
3. Välj "Greater than or equal to 200"
4. Se alla blockerade emails

### Tidslinje-graf:
1. Skapa ny kolumn: `=DATE(LEFT(A2,10))`
2. Skapa pivot-tabell med datum på X-axeln
3. Räkna antal loggar per dag
4. Skapa linjegraf

## Säkerhet

### Data Protection:
- CSV innehåller känslig data (personnummer, emails)
- **Viktigt:** Spara CSV-filer säkert
- Radera efter användning
- Använd krypterad lagring

### Access Control:
- Endast autentiserade användare kan exportera
- Logga alla export-requests (TODO: implementera)
- Rate limiting på export-endpoint (TODO: implementera)

## Framtida förbättringar

1. **Filtrera på recipient email** - Sök efter specifik mottagare
2. **Exportera som JSON** - För programmatisk analys
3. **Exportera som PDF** - För rapporter
4. **Scheduled exports** - Automatisk export varje vecka
5. **Email export** - Skicka CSV via email
6. **Komprimering** - ZIP stora CSV-filer
7. **Kryptering** - Kryptera CSV med lösenord

## Testning

### Test 1: Exportera alla loggar
```bash
curl "http://localhost:3030/api/security/export" -o audit.csv
```

### Test 2: Exportera senaste dygnet
```bash
curl "http://localhost:3030/api/security/export?timeRange=day" -o audit-day.csv
```

### Test 3: Exportera SOCIAL-profilen
```bash
curl "http://localhost:3030/api/security/export?profileType=SOCIAL" -o audit-social.csv
```

### Test 4: Verifiera CSV-format
```bash
# Öppna i Excel/Google Sheets
# Kontrollera att alla kolumner finns
# Kontrollera att quotes är escaped korrekt
# Kontrollera att svenska tecken (åäö) visas korrekt
```

## Felsökning

### Problem: Tomma CSV-filer
**Lösning:** Kontrollera att SecurityAudit-tabellen har data

### Problem: Fel encoding (åäö visas fel)
**Lösning:** CSV använder UTF-8, öppna med rätt encoding i Excel

### Problem: Quotes i findings-kolumnen
**Lösning:** Quotes är escaped med dubbla quotes (`""`)

### Problem: Export tar för lång tid
**Lösning:** Filtrera på mindre tidsperiod eller lägg till pagination

## Performance

### Optimering för stora dataset:
- **Pagination:** Exportera i batchar om 10,000 rader
- **Streaming:** Använd Node.js streams för stora filer
- **Compression:** Komprimera CSV med gzip
- **Caching:** Cacha export-resultat i 5 minuter

### Nuvarande begränsningar:
- Ingen limit på antal rader (kan bli långsamt för >100k rader)
- Ingen streaming (laddar allt i minnet)
- Ingen compression

## Sammanfattning

✅ **CSV-export endpoint** skapad (`/api/security/export`)  
✅ **Export-knapp** i dashboard med nedladdningsikon  
✅ **Filtrering** på tidsperiod och profiltyp  
✅ **Automatisk nedladdning** med korrekt filename  
✅ **UTF-8 encoding** för svenska/norska tecken  
✅ **Escaped quotes** i findings-kolumnen  
✅ **Sorterad** efter timestamp (nyast först)  

**Status:** Klar för Norge-mötet! 🇳🇴

---

**Säkerhetschefernas favorit-funktion är nu implementerad!**
