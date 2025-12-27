# 🚀 Få Data i Dashboarden - SNABBGUIDE

## Problem
Dashboarden visar 0 skanningar eftersom Prisma inte kan läsa `.env`-filen.

## Lösning (2 minuter)

### Steg 1: Exportera DATABASE_URL i terminalen

```bash
cd /Users/admin/CascadeProjects/agent-memory-vault

# Exportera DATABASE_URL så Prisma hittar den
export DATABASE_URL="postgresql://neondb_owner:npg_Ti9GWrtycav4@ep-ancient-band-agblehyd.eu-central-1.aws.neon.tech/neondb?sslmode=require"
```

### Steg 2: Kör Prisma-kommandon

```bash
# Generera Prisma Client
npx prisma generate

# Skapa tabeller i Neon
npx prisma db push

# Fyll med 30 testdata-händelser
npm run seed
```

### Steg 3: Starta servern

```bash
npm run dev
```

### Steg 4: Öppna dashboard

```
http://localhost:3030/security-dashboard
```

---

## Alternativ: Kör allt i ett kommando

```bash
cd /Users/admin/CascadeProjects/agent-memory-vault && \
export DATABASE_URL="postgresql://neondb_owner:npg_Ti9GWrtycav4@ep-ancient-band-agblehyd.eu-central-1.aws.neon.tech/neondb?sslmode=require" && \
npx prisma generate && \
npx prisma db push && \
npm run seed && \
npm run dev
```

---

## Vad du ska se efter seeding

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

---

## Nya visuella förbättringar

### Header
- ✅ Gradient blå bakgrund (blue-600 → blue-800)
- ✅ Större titel med emoji (🛡️)
- ✅ Glassmorphism på språkväljare och knappar
- ✅ Hover-effekter med scale

### Metrics-kort
- ✅ Större siffror (text-4xl)
- ✅ Ikoner i varje kort (📊, 🚫, ⚠️, ✅)
- ✅ Gradient-bakgrund på Blockerade och Status
- ✅ Hover shadow-effekt
- ✅ Rounded-xl för mjukare hörn

### Risk Trend Chart
- ✅ Större padding (p-8)
- ✅ Emoji i titel (📈)
- ✅ Färgade legend-badges med border
- ✅ Shadow på legend-punkter

### Profiler & Alerts
- ✅ Ikoner i rubriker (📊, 🚨)
- ✅ Större rubriker (text-xl)
- ✅ Rounded-xl kort

### Footer
- ✅ Gradient bakgrund (blue-50 → indigo-50)
- ✅ Border och padding
- ✅ Norge-flagga emoji (🇳🇴)

---

## Färgschema

- **Primary:** Blue-600 (header, links)
- **Success:** Green-500 (export-knapp, status)
- **Danger:** Red-600 (blockerade, critical)
- **Warning:** Yellow-500 (varningar)
- **Background:** Gray-50 → Gray-100 gradient

---

**🎯 Kör kommandona ovan så ser du den nya designen med data!**
