# 🚀 Neon.tech Setup - 2 minuter

## Steg-för-steg (följ exakt)

### 1. Skapa Neon-konto (30 sekunder)
1. Öppna: https://console.neon.tech/signup
2. Klicka "Sign up with GitHub" (snabbast)
3. Eller använd email

### 2. Skapa databas (30 sekunder)
1. Efter inloggning, klicka "Create a project"
2. **Project name:** `agent-memory-vault`
3. **Region:** Välj närmaste (Europe West för Norge)
4. **PostgreSQL version:** 16 (default)
5. Klicka "Create project"

### 3. Kopiera Connection String (30 sekunder)
1. Du ser nu en "Connection Details" ruta
2. Klicka på "Connection string"
3. Välj "Pooled connection" (rekommenderat)
4. Kopiera hela strängen (börjar med `postgresql://`)

**Exempel på hur den ser ut:**
```
postgresql://neondb_owner:npg_xxxxxxxxxxxx@ep-cool-name-12345.eu-central-1.aws.neon.tech/neondb?sslmode=require
```

### 4. Klistra in i .env (30 sekunder)
1. Öppna `/Users/admin/CascadeProjects/agent-memory-vault/.env`
2. Ersätt DATABASE_URL med din Neon-sträng:

```bash
DATABASE_URL="postgresql://neondb_owner:npg_xxxxxxxxxxxx@ep-cool-name-12345.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

3. Spara filen

### 5. Testa (30 sekunder)
```bash
cd /Users/admin/CascadeProjects/agent-memory-vault

# Generera Prisma Client
npx prisma generate

# Skapa tabeller
npx prisma db push

# Seed testdata
npm run seed

# Starta servern
npm run dev
```

---

## ✅ Fördelar med Neon

- ✅ **Gratis tier:** 0.5 GB lagring, 3 projekt
- ✅ **Ingen installation:** Fungerar direkt
- ✅ **Serverless:** Sover när du inte använder den
- ✅ **Branching:** Skapa test-databaser enkelt
- ✅ **Backup:** Automatiska backups
- ✅ **Production-ready:** Samma setup som produktion

---

## 🎯 Komplett .env efter Neon-setup

```bash
# Database (NEON)
DATABASE_URL="postgresql://neondb_owner:npg_xxxxxxxxxxxx@ep-cool-name-12345.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# Ollama Security Bridge (optional - för AI-scanning)
OLLAMA_URL="http://localhost:11434"
OLLAMA_MODEL="llama2"
OLLAMA_ENABLED="false"

# ERS Configuration
ERS_PROFILE="SOCIAL"
ERS_BLOCK_THRESHOLD="200"
ENABLE_DEEP_SCAN="false"

# Email Alerts (för demo - SMTP disabled)
SMTP_ENABLED="false"
ADMIN_ALERT_EMAIL="security@norgesikkerhet.no"
ALERT_FROM_EMAIL="alerts@ers.no"
RESEND_API_KEY="re_xxxxxxxxxxxx"

# Next.js
NEXT_PUBLIC_OLLAMA_ENABLED="false"
NEXT_PUBLIC_DASHBOARD_URL="http://localhost:3030"
```

---

## 🔍 Verifiera att det fungerar

```bash
# 1. Testa anslutning
npx prisma db pull

# 2. Skapa schema
npx prisma db push

# 3. Öppna Prisma Studio
npx prisma studio

# 4. Seed testdata
npm run seed

# 5. Starta servern
npm run dev
```

---

## 💡 Tips

- **Connection string:** Spara den säkert, du kan alltid hitta den i Neon Console
- **Dashboard:** https://console.neon.tech - se queries, metrics, backups
- **Branching:** Skapa test-databaser för experiment
- **Gratis tier:** Räcker gott för demo och utveckling

---

**🎯 Total tid: ~2 minuter från start till fungerande databas!**
