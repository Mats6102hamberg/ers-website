# 🎯 Demo Setup Guide - Norge-mötet

## Snabbstart (3 steg)

```bash
# 1. Installera dependencies (inkl. chart.js)
npm install

# 2. Skapa databas-schema (om inte redan gjort)
npx prisma db push

# 3. Fyll databasen med testdata
npm run seed
```

**Klart!** Öppna `http://localhost:3030/security-dashboard` och demot är redo.

---

## Detaljerade instruktioner

### Steg 1: Installera Dependencies

```bash
cd /Users/admin/CascadeProjects/agent-memory-vault
npm install
```

**Vad installeras:**
- `chart.js@^4.4.1` - Chart-bibliotek
- `react-chartjs-2@^5.2.0` - React-wrapper för Chart.js
- Alla andra dependencies från package.json

**Förväntat resultat:**
```
added 2 packages, and audited 123 packages in 5s
```

### Steg 2: Verifiera Databas

```bash
# Kontrollera att DATABASE_URL är satt i .env
cat .env | grep DATABASE_URL

# Skapa/uppdatera databas-schema
npx prisma db push

# (Optional) Öppna Prisma Studio för att se databasen
npx prisma studio
```

**Förväntat resultat:**
```
✔ Generated Prisma Client
✔ The database is now in sync with the Prisma schema
```

### Steg 3: Seed Testdata

```bash
npm run seed
```

**Vad händer:**
- Skapar 30 fejkade säkerhetshändelser
- Fördelade över de senaste 7 dagarna
- Blandar CRITICAL, HIGH, MEDIUM, LOW risk
- Använder Norge-specifika mönster (Fødselsnummer, Saksnummer, NAV-vedtak)

**Förväntat resultat:**
```
🌱 Starting to seed security data...
🚫 Created event: SOCIAL | Risk: 200 | 2025-12-14
🧹 Created event: MEDICAL | Risk: 125 | 2025-12-15
✅ Created event: ENTERPRISE | Risk: 35 | 2025-12-16
...

✅ Successfully seeded 30 security events!

📊 Summary:
   🚫 Blocked (CRITICAL): 8
   🧹 Sanitized (HIGH): 12
   ✅ Clean (LOW/MEDIUM): 10
   📈 Average risk score: 87.3

🎯 Dashboard is now ready for demo!
```

### Steg 4: Starta Servern

```bash
npm run dev
```

**Öppna i webbläsare:**
```
http://localhost:3030/security-dashboard
```

---

## Testdata-detaljer

### Norge-specifika mönster i testdata:

| Mönster | Severity | Exempel |
|---------|----------|---------|
| Norwegian Fødselsnummer | CRITICAL | 010190-12345 |
| Saksnummer | HIGH | SAK-2024/12345 |
| NAV Decision Number | HIGH | VEDTAK-2024-001 |
| Bank Account Number | MEDIUM | 1234-56-78901 |
| Personnummer (SE) | CRITICAL | 901010-1234 |
| Email Address | LOW | user@example.com |
| Phone Number | LOW | +47 12345678 |

### Fördelning:

- **30 händelser** totalt
- **7 dagar** historik
- **3 profiler:** SOCIAL, MEDICAL, ENTERPRISE
- **4 content types:** email_subject, email_html, email_text, document

### Risk-fördelning (ungefärlig):

- 🚫 **CRITICAL (≥200):** ~25% (7-8 händelser)
- 🧹 **HIGH (100-199):** ~40% (12-13 händelser)
- ✅ **MEDIUM/LOW (<100):** ~35% (10-11 händelser)

---

## Verifiering

### Kontrollera att allt fungerar:

1. **Dashboard laddas:**
   - Öppna `http://localhost:3030/security-dashboard`
   - Ingen laddningsindikator ska visas

2. **Metrics visar data:**
   - Totala skanningar: ~30
   - Blockerade: ~8
   - Genomsnittlig risk: ~80-90

3. **Risk Trend Chart:**
   - Grafen ska visa data för 7 dagar
   - Röd linje (CRITICAL) och blå linje (HIGH)
   - Inte tom!

4. **Språkväljare:**
   - Klicka på 🇳🇴 Norsk
   - Alla etiketter uppdateras
   - "Personnummer" → "Fødselsnummer"

5. **Export-knapp:**
   - Klicka på "Exportera Audit-logg (CSV)"
   - CSV-fil laddas ner
   - Innehåller 30 rader

---

## Felsökning

### Problem: "Cannot find module 'chart.js'"

**Lösning:**
```bash
npm install chart.js react-chartjs-2
```

### Problem: "Table 'SecurityAudit' does not exist"

**Lösning:**
```bash
npx prisma db push
npx prisma generate
```

### Problem: Grafen är tom

**Lösning:**
```bash
# Kör seeding igen
npm run seed

# Verifiera i Prisma Studio
npx prisma studio
# Öppna SecurityAudit-tabellen och kontrollera att det finns data
```

### Problem: Seeding ger fel

**Lösning:**
```bash
# Kontrollera DATABASE_URL
echo $DATABASE_URL

# Testa Prisma-anslutning
npx prisma db pull

# Kör seeding med debug
node scripts/seed-security-data.js
```

### Problem: Port 3000 redan används

**Lösning:**
```bash
# Använd annan port
PORT=3001 npm run dev

# Eller döda processen på port 3000
lsof -ti:3000 | xargs kill
```

---

## Demo-checklista

Innan Norge-mötet, kontrollera:

- [ ] `npm install` körts
- [ ] `npx prisma db push` körts
- [ ] `npm run seed` körts
- [ ] Dashboard öppnas på `http://localhost:3030/security-dashboard`
- [ ] Metrics visar ~30 skanningar
- [ ] Risk Trend Chart visar data för 7 dagar
- [ ] Språkväljare fungerar (🇸🇪 Svenska / 🇳🇴 Norsk)
- [ ] Export-knapp laddar ner CSV
- [ ] Profiler visar SOCIAL, MEDICAL, ENTERPRISE
- [ ] Senaste varningar visar händelser
- [ ] Högsta riskfynd-tabell visar data

---

## Rensa testdata (efter demo)

```bash
# Radera alla SecurityAudit-poster
npx prisma studio
# Öppna SecurityAudit → Select all → Delete

# Eller via SQL
npx prisma db execute --stdin <<< "DELETE FROM SecurityAudit;"
```

---

## Tips för demot

### 1. Förbered webbläsare
- Öppna dashboard i fullskärm
- Stäng andra flikar
- Zoom till 100% (Cmd+0)

### 2. Visa språkväljare först
```
"Innan vi börjar, låt mig visa er en liten detalj som visar
att systemet är anpassat för Norge..."
[Klicka på 🇳🇴 Norsk]
```

### 3. Förklara grafen
```
"Här ser ni Risk Trend för de senaste 7 dagarna. Den röda
linjen visar KRITISKA händelser som blockerats, och den blå
linjen visar HØY-risk händelser som saniterats."
```

### 4. Visa Norge-mönster
```
"I footer ser ni att systemet har Norge-spesifikke mønstre
aktive: Fødselsnummer, Saksnummer, NAV-vedtak. Detta är
exakt de termer som används i Norge."
```

### 5. Demonstrera export
```
"Om ni vill analysera data i Excel, kan ni exportera hela
audit-loggen som CSV..."
[Klicka på Export-knapp]
```

---

**🎯 Lycka till med demot!**
