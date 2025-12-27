/**
 * Petanque Guide Landing Page
 * 
 * Displays language selector and links to all chapters.
 * Uses the isolated Legacy layout CSS.
 */

const languages = [
  { code: 'sv', label: 'Svenska', flag: '🇸🇪' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
];

const chapters = [
  { id: '00-forord', title: 'Förord', chapter: 0 },
  { id: '01-vad-ar-boule-petanque', title: 'Vad är boule pétanque?', chapter: 1 },
  { id: '02-utrustning-valj-ratt-klot', title: 'Utrustning – välj rätt klot', chapter: 2 },
  { id: '03-grundtekniker', title: 'Grundtekniker', chapter: 3 },
  { id: '04-spelstrategi-for-nyborjare', title: 'Spelstrategi för nybörjare', chapter: 4 },
  { id: '05-forbattra-din-point', title: 'Förbättra din point', chapter: 5 },
  { id: '06-masterskapsskjutning-tirer-au-fer', title: 'Mästerskapsskjutning (tirer au fer)', chapter: 6 },
  { id: '07-taktik-pa-hog-niva', title: 'Taktik på hög nivå', chapter: 7 },
  { id: '08-trana-smartare', title: 'Träna smartare', chapter: 8 },
  { id: '09-tavlingsspel-vs-socialt-spel', title: 'Tävlingsspel vs. socialt spel', chapter: 9 },
  { id: '10-petanque-runt-om-i-varlden', title: 'Pétanque runt om i världen', chapter: 10 },
  { id: '11-strategisk-analys-och-taktik', title: 'Strategisk analys och taktik', chapter: 11 },
  { id: '12-mental-styrka-och-fokus', title: 'Mental styrka och fokus', chapter: 12 },
  { id: '13-traningsplan-och-utveckling', title: 'Träningsplan och utveckling', chapter: 13 },
  { id: '14-fysisk-traning-for-petanque', title: 'Fysisk träning för pétanque', chapter: 14 },
  { id: '15-att-leda-ett-lag-i-boule-petanque', title: 'Att leda ett lag i Boule Pétanque', chapter: 15 },
  { id: '16-klotfysik-och-banelasning', title: 'Klotfysik och baneläsning', chapter: 16 },
];

const appendices = [
  { id: 'bilaga-a-utrustningsguide', title: 'Bilaga A: Utrustningsguide' },
  { id: 'bilaga-b-komplett-regelbok', title: 'Bilaga B: Komplett regelbok' },
  { id: 'bilaga-c-ordforklaringar', title: 'Bilaga C: Ordförklaringar' },
  { id: 'resurser', title: 'Resurser' },
];

export default function PetanqueGuidePage() {
  return (
    <>
      <h1>Pétanque – Den kompletta Guiden</h1>
      <p className="muted">16 kapitel • 6 språk • Originaldesign bevarad</p>

      <h2>Välj språk</h2>
      <div className="lang">
        {languages.map((lang) => (
          <a key={lang.code} href={`/guide/${lang.code}`}>
            {lang.flag} {lang.label}
          </a>
        ))}
      </div>

      <h2>Innehåll (Svenska)</h2>
      <div className="grid">
        {chapters.map((ch) => (
          <div key={ch.id} className="card">
            <a href={`/guide/sv/${ch.id}`}>
              <strong>
                {ch.chapter > 0 ? `Kapitel ${ch.chapter} – ` : ''}
                {ch.title}
              </strong>
            </a>
            <span className="chip">Kapitel {ch.chapter}</span>
          </div>
        ))}
      </div>

      <h2>Bilagor</h2>
      <div className="grid">
        {appendices.map((app) => (
          <div key={app.id} className="card">
            <a href={`/guide/sv/${app.id}`}>
              <strong>{app.title}</strong>
            </a>
          </div>
        ))}
      </div>

      <p className="muted" style={{ marginTop: '2rem' }}>
        📖 Originaldesign från petanque-den-kompletta-guiden.vercel.app
      </p>
    </>
  );
}
