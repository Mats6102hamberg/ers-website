# ⚡ SNABB NEON SETUP - 2 MINUTER

## 🎯 Du behöver göra detta NU för att demot ska fungera

---

## Steg 1: Skapa Neon-konto (30 sek)

**Öppna denna länk:**
👉 https://console.neon.tech/signup

**Välj:**
- "Sign up with GitHub" (snabbast)
- Eller använd email

---

## Steg 2: Skapa projekt (30 sek)

Efter inloggning:

1. Klicka **"Create a project"**
2. **Project name:** `agent-memory-vault`
3. **Region:** Välj `Europe (Frankfurt)` eller `Europe (London)`
4. Klicka **"Create project"**

---

## Steg 3: Kopiera Connection String (30 sek)

Du ser nu en sida med "Connection Details":

1. Hitta **"Connection string"** sektionen
2. Välj **"Pooled connection"** (viktigt!)
3. Klicka på **"Copy"** ikonen
4. Du har nu kopierat något som ser ut så här:

```
postgresql://neondb_owner:npg_AbCdEf123456@ep-cool-name-12345.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

---

## Steg 4: Klistra in i .env (30 sek)

1. Öppna filen: `/Users/admin/CascadeProjects/agent-memory-vault/.env`

2. Hitta raden:
```bash
DATABASE_URL="KLISTRA_IN_DIN_NEON_CONNECTION_STRING_HÄR"
```

3. Ersätt med din kopierade sträng:
```bash
DATABASE_URL="postgresql://neondb_owner:npg_AbCdEf123456@ep-cool-name-12345.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

4. **SPARA FILEN** (Cmd+S)

---

## Steg 5: Testa att det fungerar (1 min)

Kör dessa kommandon i terminalen:

```bash
cd /Users/admin/CascadeProjects/agent-memory-vault

# 1. Generera Prisma Client
npx prisma generate

# 2. Skapa tabeller i databasen
npx prisma db push

# 3. Fyll med 30 testdata-händelser
npm run seed

# 4. Starta servern
npm run dev
```

**Öppna i webbläsare:**
```
http://localhost:3030/security-dashboard
```

---

## ✅ Checklista

- [ ] Skapat Neon-konto
- [ ] Skapat projekt "agent-memory-vault"
- [ ] Kopierat "Pooled connection string"
- [ ] Klistrat in i `.env` filen
- [ ] Sparat `.env` filen
- [ ] Kört `npx prisma generate` (fungerar utan fel)
- [ ] Kört `npx prisma db push` (skapar tabeller)
- [ ] Kört `npm run seed` (skapar 30 testdata-händelser)
- [ ] Kört `npm run dev` (startar servern)
- [ ] Dashboard öppnas och visar data

---

## 🚨 Om något går fel

### Fel: "Missing required environment variable: DATABASE_URL"

**Lösning:** Du har inte sparat `.env` filen eller DATABASE_URL är fortfarande placeholder-text.

```bash
# Kontrollera att .env innehåller rätt URL:
cat .env | grep DATABASE_URL

# Ska visa din Neon-URL, INTE "KLISTRA_IN_DIN_NEON_CONNECTION_STRING_HÄR"
```

### Fel: "Can't reach database server"

**Lösning:** Connection string är fel kopierad eller du valde "Direct connection" istället för "Pooled connection".

1. Gå tillbaka till Neon Console
2. Klicka på ditt projekt
3. Välj "Connection string" → "Pooled connection"
4. Kopiera igen

### Fel: "Table does not exist"

**Lösning:** Du glömde köra `npx prisma db push`

```bash
npx prisma db push
```

---

## 💡 Varför Neon?

- ✅ **Gratis:** 0.5 GB lagring, perfekt för demo
- ✅ **Ingen installation:** Fungerar direkt
- ✅ **Serverless:** Sover när du inte använder den (sparar resurser)
- ✅ **Production-ready:** Samma setup som produktion
- ✅ **Backup:** Automatiska backups
- ✅ **Dashboard:** Se queries och metrics i real-time

---

## 📍 Var hittar jag min Connection String senare?

1. Gå till: https://console.neon.tech
2. Klicka på ditt projekt: "agent-memory-vault"
3. Klicka på "Connection Details"
4. Välj "Pooled connection"
5. Kopiera

---

**🎯 Total tid: ~2 minuter från start till fungerande databas!**

**Efter detta fungerar:**
- ✅ `npx prisma generate`
- ✅ `npx prisma db push`
- ✅ `npm run seed`
- ✅ `npm run dev`
- ✅ Dashboard med data och grafer
