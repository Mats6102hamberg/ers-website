# ERS Website - Enterprise Research Shield

En professionell landningssida för Enterprise Research Shield.

---

## 📁 Filstruktur

```
ers-website/
├── index.html          ← Huvudsidan (rör den inte)
├── css/
│   └── style.css       ← Designen (färger överst)
├── js/
│   └── main.js         ← Logiken (rör den inte)
├── content/
│   └── content.json    ← ⭐ ALLA TEXTER HÄR ⭐
├── images/             ← Lägg bilder/logotyp här
└── README.md           ← Denna fil
```

---

## ✏️ Så här ändrar du innehåll

### 1. Öppna `content/content.json`

Alla texter på sidan finns i denna fil. Strukturen är uppdelad i sektioner:

| Sektion | Vad den styr |
|---------|--------------|
| `meta` | Sidtitel och SEO-beskrivning |
| `header` | Logotyp, navigation, CTA-knapp |
| `hero` | Huvudrubrik och intro |
| `trust_banner` | De tre förtroendepunkterna |
| `features` | "Varför ERS?"-korten |
| `modes` | De tre driftlägena |
| `security` | Säkerhetsåtaganden |
| `target_audiences` | Målgrupper |
| `cta_section` | Call-to-action sektionen |
| `contact` | Kontaktformulär och företagsinfo |
| `footer` | Sidfot |

### 2. Exempel: Ändra kontaktuppgifter

Hitta `contact` → `company_info` i filen:

```json
"company_info": {
  "name": "SmartFlow AB",
  "org_number": "559050-6894",
  "address": "Reimersholmsgatan 123, Stockholm",  ← Lägg till adress
  "email": "kontakt@smartflow.se",                ← Lägg till email
  "phone": "+46 70 123 45 67"                     ← Lägg till telefon
}
```

### 3. Spara och ladda om sidan

Ändringarna syns direkt när du laddar om webbläsaren.

---

## 🎨 Så här ändrar du design

### Färger

Öppna `css/style.css` och hitta `:root` högst upp:

```css
:root {
  /* Primärfärger (mörka) */
  --color-primary: #0f172a;       ← Mörkblå bakgrund
  
  /* Accentfärger (gröna) */
  --color-accent: #10b981;        ← Grön accent
  
  /* Statusfärger för driftlägen */
  --color-green: #10b981;         ← Research Mode
  --color-amber: #f59e0b;         ← Adversarial Log Mode
  --color-red: #ef4444;           ← Strict Mode
}
```

Byt ut hex-koderna för att ändra färgtema.

### Typsnitt

Typsnittet (DM Sans) laddas från Google Fonts. För att byta:

1. Gå till [fonts.google.com](https://fonts.google.com)
2. Välj ett typsnitt och kopiera `<link>`-taggen
3. Klistra in i `index.html` (ersätt befintlig font-länk)
4. Uppdatera `--font-display` och `--font-body` i CSS

---

## 📧 Kontaktformulär

Formuläret är förberett men skickar ingenstans just nu. 

### Alternativ för att aktivera:

**1. Formspree (enklast)**
1. Skapa konto på [formspree.io](https://formspree.io)
2. Skapa ett formulär och kopiera endpoint-URL
3. I `content.json`, uppdatera:
   ```json
   "form": {
     "action_url": "https://formspree.io/f/DITT_ID"
   }
   ```

**2. Netlify Forms**
Om du hostar på Netlify, lägg till `netlify` attribut på formuläret.

**3. Egen backend**
Peka `action_url` till din egen server/API.

---

## 🚀 Publicering

### GitHub Pages (gratis)

1. Skapa ett GitHub-repo
2. Ladda upp alla filer
3. Gå till Settings → Pages
4. Välj branch `main` och spara
5. Din sida finns på `https://dittnamn.github.io/reponamn`

### Netlify (gratis)

1. Gå till [netlify.com](https://netlify.com)
2. Dra och släpp hela `ers-website`-mappen
3. Klart! Du får en URL direkt

### Egen server

Ladda upp filerna till valfri webbserver. Ingen server-side kod krävs.

---

## 🔒 Säkerhet

- Sidan är statisk (ingen databas, ingen server-kod)
- Alla texter ligger i JSON-filen
- Formuläret kräver en extern tjänst för att faktiskt skicka data
- Lägg ALDRIG känslig information i `content.json`

---

## ❓ Vanliga frågor

**Varför visas inte mina ändringar?**
- Kontrollera att JSON-filen är korrekt formaterad (inga kommatecken som saknas)
- Tömma webbläsarens cache (Ctrl+Shift+R)
- Öppna webbläsarens konsol (F12) för felmeddelanden

**Hur lägger jag till en logotyp?**
1. Lägg bilden i `images/`-mappen
2. I `css/style.css`, hitta `.logo__icon` och ersätt bakgrunden med:
   ```css
   .logo__icon {
     background: url('../images/din-logo.png') center/contain no-repeat;
   }
   ```

**Kan jag lägga till fler sektioner?**
Ja, men det kräver ändringar i `main.js`. Kontakta mig så hjälper jag till.

---

## 📞 Support

Skapad av Claude i samarbete med Mats.
Vid frågor eller ändringar, fortsätt konversationen!
