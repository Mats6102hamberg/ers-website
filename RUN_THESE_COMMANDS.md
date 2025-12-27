# ✅ DATABASE_URL ÄR NU KONFIGURERAD!

Din `.env`-fil är nu uppdaterad med Neon-databasen.

---

## 🚀 KÖR DESSA KOMMANDON NU (i din terminal)

```bash
cd /Users/admin/CascadeProjects/agent-memory-vault

# 1. Generera Prisma Client
npx prisma generate

# 2. Skapa tabeller i Neon-databasen
npx prisma db push

# 3. Fyll med 30 testdata-händelser
npm run seed

# 4. Starta servern
npm run dev
```

---

## 📋 Vad varje kommando gör

### 1. `npx prisma generate`
- Genererar Prisma Client från schema
- Måste köras först
- Tar ~5 sekunder

**Förväntat resultat:**
```
✔ Generated Prisma Client (v6.19.0)
```

### 2. `npx prisma db push`
- Skapar SecurityAudit-tabellen i Neon
- Synkar schema med databasen
- Tar ~10 sekunder

**Förväntat resultat:**
```
✔ Generated Prisma Client
✔ The database is now in sync with the Prisma schema
```

### 3. `npm run seed`
- Skapar 30 fejkade säkerhetshändelser
- Fördelade över 7 dagar
- Norge-specifika mönster

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

### 4. `npm run dev`
- Startar Next.js development server
- Lyssnar på port 3000

**Förväntat resultat:**
```
▲ Next.js 16.1.0
- Local:        http://localhost:3030
- Ready in 2.3s
```

---

## 🌐 Öppna Dashboard

Efter att servern startat:

**Öppna i webbläsare:**
```
http://localhost:3030/security-dashboard
```

---

## ✅ Vad du ska se i dashboarden

- **Metrics:** ~30 skanningar, ~8 blockerade
- **Risk Trend Chart:** Graf med data för 7 dagar (röd + blå linjer)
- **Språkväljare:** 🇸🇪 Svenska / 🇳🇴 Norsk (klickbar)
- **Profiler:** SOCIAL, MEDICAL, ENTERPRISE
- **Senaste varningar:** Lista med händelser
- **Högsta riskfynd:** Tabell med data
- **Export-knapp:** Laddar ner CSV

---

## 🇳🇴 Testa språkväljare

1. Klicka på **🇳🇴 Norsk** i header
2. Alla etiketter uppdateras:
   - "Personnummer" → "Fødselsnummer"
   - "Ärendenummer" → "Saksnummer"
   - "Senaste dygnet" → "Siste døgnet"

---

## 🎯 Checklista

- [ ] Kört `npx prisma generate` ✅
- [ ] Kört `npx prisma db push` ✅
- [ ] Kört `npm run seed` ✅
- [ ] Kört `npm run dev` ✅
- [ ] Öppnat `http://localhost:3030/security-dashboard`
- [ ] Grafen visar data (inte tom)
- [ ] Språkväljare fungerar
- [ ] Export-knapp fungerar

---

## 🚨 Om något går fel

### Fel: "command not found: npx"

**Lösning:** Node.js är inte i PATH. Prova:
```bash
# Hitta Node.js
which node

# Om det fungerar, använd node direkt:
node_modules/.bin/prisma generate
node_modules/.bin/prisma db push
```

### Fel: "Can't reach database server"

**Lösning:** DATABASE_URL är fel. Kontrollera:
```bash
cat .env | grep DATABASE_URL

# Ska visa din Neon-URL, inte placeholder-text
```

### Fel: "Table already exists"

**Lösning:** Tabellen finns redan, hoppa över `db push`:
```bash
npm run seed
npm run dev
```

---

**🎯 Kör kommandona ovan i din terminal nu!**
