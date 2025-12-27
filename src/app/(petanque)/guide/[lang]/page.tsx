/**
 * Language-specific Table of Contents
 * 
 * Displays all chapters for a selected language using the Legacy layout.
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getChaptersForLanguage,
  isValidLanguage,
  LANGUAGE_LABELS,
  LANGUAGE_FLAGS,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '@/lib/petanque-content';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateStaticParams() {
  return SUPPORTED_LANGUAGES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: PageProps) {
  const { lang } = await params;
  
  if (!isValidLanguage(lang)) {
    return { title: 'Not Found' };
  }

  return {
    title: `Pétanque Guiden – ${LANGUAGE_LABELS[lang]}`,
    description: `Innehållsförteckning på ${LANGUAGE_LABELS[lang]}`,
  };
}

export default async function LanguageTocPage({ params }: PageProps) {
  const { lang } = await params;

  if (!isValidLanguage(lang)) {
    notFound();
  }

  const chapters = getChaptersForLanguage(lang);

  // Separate chapters and appendices
  const mainChapters = chapters.filter(ch => !ch.slug.startsWith('bilaga') && ch.slug !== 'resurser');
  const appendices = chapters.filter(ch => ch.slug.startsWith('bilaga') || ch.slug === 'resurser');

  return (
    <>
      <h1>{LANGUAGE_FLAGS[lang]} Pétanque – {LANGUAGE_LABELS[lang]}</h1>
      <p className="muted">16 kapitel • Originaldesign bevarad</p>

      <div className="lang">
        {SUPPORTED_LANGUAGES.map((l) => (
          <Link
            key={l}
            href={`/guide/${l}`}
            style={l === lang ? { background: '#f0f0f0', fontWeight: 'bold' } : {}}
          >
            {LANGUAGE_FLAGS[l]} {LANGUAGE_LABELS[l]}
          </Link>
        ))}
      </div>

      <h2>Innehåll</h2>
      <div className="grid">
        {mainChapters.map((ch) => (
          <div key={ch.slug} className="card">
            <Link href={`/guide/${lang}/${ch.slug}`}>
              <strong>{ch.title}</strong>
            </Link>
          </div>
        ))}
      </div>

      {appendices.length > 0 && (
        <>
          <h2>Bilagor & Resurser</h2>
          <div className="grid">
            {appendices.map((ch) => (
              <div key={ch.slug} className="card">
                <Link href={`/guide/${lang}/${ch.slug}`}>
                  <strong>{ch.title}</strong>
                </Link>
              </div>
            ))}
          </div>
        </>
      )}

      <p className="muted" style={{ marginTop: '2rem' }}>
        <Link href="/guide">← Tillbaka till språkval</Link>
      </p>
    </>
  );
}
