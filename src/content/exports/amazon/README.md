# Amazon Kindle Export

Denna mapp innehåller metadata och exportfiler för Amazon Kindle Direct Publishing (KDP).

## Struktur

```
amazon/
├── README.md          # Denna fil
├── sv/                # Svenska
│   └── metadata.md    # Amazon-metadata för svenska versionen
├── en/                # English
│   └── metadata.md    # Amazon metadata for English version
└── fr/                # Français
    └── metadata.md    # Métadonnées Amazon pour la version française
```

## Arbetsflöde för Amazon-publicering

1. **Förbered metadata** – Fyll i `metadata.md` för varje språk
2. **Exportera innehåll** – Generera Kindle-kompatibla filer (EPUB/MOBI)
3. **Skapa omslag** – 2560 x 1600 px (Kindle) eller 1600 x 2560 px (portrait)
4. **Testa** – Använd Kindle Previewer för att verifiera formatering
5. **Publicera** – Ladda upp till KDP Dashboard

## Viktiga Amazon-krav

- **Titel:** Max 200 tecken
- **Beskrivning:** Max 4000 tecken
- **Sökord:** Max 7 st, vardera max 50 tecken
- **Kategorier:** Välj 2 relevanta kategorier
- **Omslag:** JPG/TIFF, minst 1000 px på kortaste sidan

## Status

| Språk | Metadata | Innehåll | Omslag | Publicerad |
|-------|----------|----------|--------|------------|
| 🇸🇪 SV | ⏳ Påbörjad | ❌ | ❌ | ❌ |
| 🇬🇧 EN | ⏳ Påbörjad | ❌ | ❌ | ❌ |
| 🇫🇷 FR | ⏳ Påbörjad | ❌ | ❌ | ❌ |
