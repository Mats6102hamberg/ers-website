# 🗄️ Database Setup Guide - PostgreSQL Configuration

## Snabbstart

Din `.env`-fil är nu konfigurerad med standardvärden för lokal PostgreSQL. Följ stegen nedan för att anpassa till din setup.

---

## 📝 DATABASE_URL Format

```
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]"
```

### Standardvärden i .env:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/agent_memory_vault"
```

**Komponenter:**
- **USER:** `postgres` (standard PostgreSQL-användare)
- **PASSWORD:** `postgres` (ändra till ditt lösenord)
- **HOST:** `localhost` (lokal databas)
- **PORT:** `5432` (standard PostgreSQL-port)
- **DATABASE:** `agent_memory_vault` (databasnamn)

---

## 🔧 Steg 1: Hitta dina PostgreSQL-credentials

### Alternativ A: Om du installerat PostgreSQL via Homebrew (Mac)

```bash
# Kontrollera om PostgreSQL körs
brew services list | grep postgresql

# Starta PostgreSQL om den inte körs
brew services start postgresql

# Anslut till PostgreSQL
psql postgres

# I psql-konsolen, lista användare:
\du

# Avsluta psql
\q
```

**Vanliga credentials:**
- User: `postgres` eller ditt Mac-användarnamn
- Password: Ofta inget lösenord för lokal dev

### Alternativ B: Om du installerat PostgreSQL via Postgres.app

```bash
# Postgres.app använder vanligtvis:
# User: ditt Mac-användarnamn
# Password: inget
# Port: 5432
```

### Alternativ C: Om du använder Docker

```bash
# Om du kör PostgreSQL i Docker:
docker ps | grep postgres

# Credentials från docker-compose.yml eller docker run-kommando
```

---

## 🔧 Steg 2: Skapa databasen

### Via psql (kommandorad):

```bash
# Anslut till PostgreSQL
psql postgres

# Skapa databas
CREATE DATABASE agent_memory_vault;

# Verifiera att den skapades
\l

# Avsluta
\q
```

### Via Postico/pgAdmin (GUI):

1. Öppna Postico eller pgAdmin
2. Anslut till localhost:5432
3. Högerklicka → Create Database
4. Namn: `agent_memory_vault`
5. Spara

---

## 🔧 Steg 3: Uppdatera .env med dina credentials

### Exempel 1: Standard PostgreSQL (med lösenord)

```bash
DATABASE_URL="postgresql://postgres:mittlösenord@localhost:5432/agent_memory_vault"
```

### Exempel 2: PostgreSQL utan lösenord (vanligt för lokal dev)

```bash
DATABASE_URL="postgresql://postgres@localhost:5432/agent_memory_vault"
```

### Exempel 3: Mac-användarnamn som user

```bash
DATABASE_URL="postgresql://admin@localhost:5432/agent_memory_vault"
```

### Exempel 4: Annan port (t.ex. 5433)

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/agent_memory_vault"
```

### Exempel 5: Docker med custom credentials

```bash
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/agent_memory_vault"
```

---

## 🔧 Steg 4: Testa anslutningen

```bash
cd /Users/admin/CascadeProjects/agent-memory-vault

# Testa Prisma-anslutning
npx prisma db pull

# Om det fungerar, skapa schema
npx prisma db push

# Verifiera att tabeller skapades
npx prisma studio
```

**Förväntat resultat:**
```
✔ Generated Prisma Client
✔ The database is now in sync with the Prisma schema
```

---

## ✅ Verifiering av alla miljövariabler

### 1. Database (KRITISK)
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/agent_memory_vault"
```
- ✅ Måste peka på din lokala PostgreSQL
- ✅ Databas måste existera
- ✅ User/password måste vara korrekt

### 2. Ollama (OPTIONAL - för AI-scanning)
```bash
OLLAMA_URL="http://localhost:11434"
OLLAMA_MODEL="llama2"
OLLAMA_ENABLED="false"
```
- ✅ `OLLAMA_ENABLED="false"` för demo (AI-scanning avstängd)
- ℹ️ Sätt till `"true"` om du har Ollama installerat

### 3. ERS Configuration
```bash
ERS_PROFILE="SOCIAL"
ERS_BLOCK_THRESHOLD="200"
ENABLE_DEEP_SCAN="false"
```
- ✅ `ERS_PROFILE="SOCIAL"` - Perfekt för Norge-demo (Fødselsnummer, Saksnummer)
- ✅ `ERS_BLOCK_THRESHOLD="200"` - Blockerar vid CRITICAL risk
- ✅ `ENABLE_DEEP_SCAN="false"` - Snabbare scanning för demo

### 4. Email Alerts
```bash
SMTP_ENABLED="false"
ADMIN_ALERT_EMAIL="security@norgesikkerhet.no"
ALERT_FROM_EMAIL="alerts@ers.no"
```
- ✅ `SMTP_ENABLED="false"` - Loggar till console istället för att skicka email
- ✅ Norge-anpassade email-adresser för demo
- ℹ️ Sätt `SMTP_ENABLED="true"` + `RESEND_API_KEY` för riktiga emails

### 5. Next.js Public Variables
```bash
NEXT_PUBLIC_OLLAMA_ENABLED="false"
NEXT_PUBLIC_DASHBOARD_URL="http://localhost:3030"
```
- ✅ Matchar OLLAMA_ENABLED
- ✅ Korrekt URL för lokal dev

---

## 🚨 Felsökning

### Problem 1: "Can't reach database server"

**Orsak:** PostgreSQL körs inte eller fel credentials

**Lösning:**
```bash
# Kontrollera om PostgreSQL körs
brew services list | grep postgresql

# Starta PostgreSQL
brew services start postgresql

# Eller om du använder Postgres.app:
# Öppna Postgres.app och klicka "Start"
```

### Problem 2: "Database does not exist"

**Orsak:** Databasen `agent_memory_vault` finns inte

**Lösning:**
```bash
# Skapa databasen
psql postgres -c "CREATE DATABASE agent_memory_vault;"

# Eller via psql:
psql postgres
CREATE DATABASE agent_memory_vault;
\q
```

### Problem 3: "Password authentication failed"

**Orsak:** Fel lösenord i DATABASE_URL

**Lösning:**
```bash
# Testa anslutning manuellt
psql -U postgres -h localhost -d postgres

# Om det fungerar, använd samma credentials i .env
# Om det inte fungerar, återställ lösenord:
psql postgres
ALTER USER postgres PASSWORD 'nyttlösenord';
\q
```

### Problem 4: "Port 5432 already in use"

**Orsak:** Annan PostgreSQL-instans körs

**Lösning:**
```bash
# Hitta vilken process som använder port 5432
lsof -i :5432

# Döda processen (om det är säkert)
kill -9 [PID]

# Eller använd annan port i .env:
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/agent_memory_vault"
```

### Problem 5: "Connection refused"

**Orsak:** PostgreSQL lyssnar inte på localhost

**Lösning:**
```bash
# Kontrollera PostgreSQL-konfiguration
cat /opt/homebrew/var/postgresql@14/postgresql.conf | grep listen_addresses

# Bör vara: listen_addresses = 'localhost' eller '*'
```

---

## 🔐 Säkerhetstips

### För utveckling (OK):
```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/agent_memory_vault"
```

### För produktion (ALDRIG):
- ❌ Använd INTE enkla lösenord som "postgres"
- ❌ Commita ALDRIG .env till Git
- ✅ Använd starka lösenord
- ✅ Använd miljövariabler i Vercel/Netlify

---

## 📋 Checklista innan demo

- [ ] PostgreSQL körs (`brew services list`)
- [ ] Databas `agent_memory_vault` existerar
- [ ] `.env` har korrekt DATABASE_URL
- [ ] `npx prisma db push` fungerar
- [ ] `npx prisma studio` visar tabeller
- [ ] `npm run seed` skapar testdata
- [ ] Dashboard öppnas på `http://localhost:3030/security-dashboard`

---

## 🎯 Snabb-test av hela setup

```bash
# 1. Testa databas-anslutning
npx prisma db pull

# 2. Skapa schema
npx prisma db push

# 3. Seed testdata
npm run seed

# 4. Öppna Prisma Studio
npx prisma studio
# Kontrollera att SecurityAudit-tabellen har ~30 rader

# 5. Starta servern
npm run dev

# 6. Öppna dashboard
open http://localhost:3030/security-dashboard
```

---

## 📚 Användbara kommandon

```bash
# Prisma
npx prisma db push          # Skapa/uppdatera schema
npx prisma db pull          # Hämta schema från databas
npx prisma generate         # Generera Prisma Client
npx prisma studio           # Öppna databas-GUI
npx prisma migrate reset    # Radera allt och börja om

# PostgreSQL
psql postgres               # Anslut till PostgreSQL
\l                          # Lista databaser
\c agent_memory_vault       # Byt till databas
\dt                         # Lista tabeller
\q                          # Avsluta

# Seeding
npm run seed                # Skapa testdata
```

---

## 🌐 Alternativ: Använd Neon (Cloud PostgreSQL)

Om du har problem med lokal PostgreSQL, använd Neon (gratis):

1. Gå till https://neon.tech
2. Skapa konto (gratis)
3. Skapa ny databas
4. Kopiera CONNECTION STRING
5. Klistra in i .env:

```bash
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
```

**Fördelar:**
- ✅ Ingen lokal installation
- ✅ Fungerar direkt
- ✅ Gratis tier räcker för demo
- ✅ Samma setup som produktion

---

**🎯 När DATABASE_URL är korrekt konfigurerad, kör:**

```bash
npx prisma db push
npm run seed
npm run dev
```

**Dashboard:** http://localhost:3030/security-dashboard
