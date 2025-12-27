# Guld – Utvecklingsfilosofi

## Utvecklingsfilosofi – Nivåer för mina appar
Jag bygger många appar parallellt och vill kunna starta snabbt, testa idéer och visa upp fungerande flöden utan onödiga hinder. Därför börjar alla mina projekt i ett "lätt" läge utan databas, och växer först när behovet finns. Det finns tre nivåer:

### Nivå 1 – Prototyp / Idé (ingen databas)
- Standardläget för alla nya appar.
- Ingen databas kopplad och inga lagrade användardata.
- Endast UI, logik och hårdkodade exempel (mock-data).
- Snabb utveckling, snabba deploys och minimalt med felkällor.
- Säkert att visa upp för andra utan att skapa frågor om lagring eller GDPR.

Perfekt när jag bygger många appar samtidigt och vill ha en ren, stabil startpunkt.

### Nivå 2 – Uppstart (databas när behov finns)
När en app börjar få riktiga användningsfall kopplar jag in en databas först när det behövs för att spara:
- användarflöden
- historik
- inställningar
- arbetsmaterial
- ekonomi eller statistik

Då lägger jag till:
- Vercel Postgres
- `DATABASE_URL` i miljövariabler
- Prisma som ORM
- Ett litet, rent schema (endast det som behövs)

Detta steg gör appen mer funktionell men fortfarande lätt att hantera.

### Nivå 3 – Robust / Produktion (för organisationer och känslig data)
När en app ska användas seriöst av andra människor eller organisationer — t.ex. kommuner, föreningar, familjehemskonsulenter eller betalande kunder — bygger jag ut den till en "Robust-version". Det innebär:
- Säker databas
- Backup och loggning
- Rättighetsstyrning
- Möjlighet att radera/anonymisera data
- Om det krävs: PUB-avtal och GDPR-rutiner
- Skalbarhet och tydlig ansvarsstruktur

Detta är slutmålet för appar som blir "på riktigt".

## Sammanfattning av min metod
Jag skapar många appar snabbt, och varje app får växa i sin egen takt. Databas kopplas inte in förrän den verkligen behövs. Det gör att jag kan:
- bygga fler idéer
- undvika onödiga tekniska problem
- jobba snabbare
- testa koncept direkt
- hålla projektet stabilt och rent
- växa varje app först när den förtjänar det

Den här filosofin gör att mina 10 appar + 10 robusta versioner blir skalbara, hållbara och lätta att vidareutveckla.

## Nuvarande nivå för detta projekt
➡️ **Nivå 1 – Ingen databas kopplad ännu.**

Appen körs helt utan lagring. När behov uppstår kan den enkelt lyftas till Nivå 2.

## Min egen anteckning – Hur jag tänker med databaser i mina appar
Det här är en påminnelse till mig själv. Jag bygger många appar parallellt, och det är viktigt att jag inte fastnar i databasstrul i början av varje projekt. Därför startar alla mina appar utan databas. Det gör utvecklingen mycket snabbare och enklare, och jag slipper problem på Vercel.

**Grundidé:**
👉 Appen ska först visa att idén fungerar. Databas kopplas på senare när det verkligen behövs.

### 🔹 Varför ingen databas i början?
- Det är onödigt att krångla innan jag vet att appen kommer användas på riktigt.
- Vercel bygger snabbare utan Prisma.
- Jag slipper frågor om GDPR, lagring, säkerhet och ansvar.
- Jag kan bygga 10 appar snabbt och fokusera på funktion och flöden.
- Om appen bara ska demonstreras eller användas lokalt räcker mock-data eller localStorage.

### 🔹 När ska jag koppla in en databas?
Jag gör det först när appen uppfyller något av detta:
- den ska börja användas av riktiga användare
- appen behöver spara historik, inställningar eller data över tid
- appen ska användas i ett verkligt sammanhang (t.ex. kommun, klubb, familjehem, ekonomi)
- appen ska lanseras eller säljas

**När det är dags lägger jag till:**
- Vercel Postgres
- `DATABASE_URL` i environment variables
- Prisma installeras lokalt
- Jag kör `npx prisma migrate dev` och `npx prisma generate`
- Databasen används endast där det är absolut nödvändigt

### 🔹 När blir appen “robust”?
Det här är nivå 3. Jag går hit när appen ska användas av:
- kommuner
- företag
- familjehemskonsulenter
- när det finns känslig information
- när jag ska ta betalt

**Då krävs:**
- seriös databas
- backup
- loggning
- rättighetsstyrning
- GDPR-hantering
- mer struktur och dokumentation

### 🔹 Kort sammanfattning (så jag minns snabbt)
- **Nivå 1:** Starta utan databas. Bygg snabbt. Inga risker.
- **Nivå 2:** Koppla databas endast när appen ska börja användas.
- **Nivå 3:** Robust-version för riktiga organisationer och känsliga data.

**Just detta projekt (Guld) är nu:**
➡️ Nivå 1 – Ingen databas kopplad. Bygg fritt och snabbt.
