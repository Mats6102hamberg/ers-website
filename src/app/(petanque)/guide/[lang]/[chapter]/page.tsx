/**
 * Individual Chapter Page
 * 
 * Renders a single chapter's content using the Legacy layout.
 * Content is read from pre-built HTML files.
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getChapterContent,
  getChapterTitle,
  getChaptersForLanguage,
  isValidLanguage,
  chapterExists,
  LANGUAGE_LABELS,
  LANGUAGE_FLAGS,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
} from '@/lib/petanque-content';

interface PageProps {
  params: Promise<{ lang: string; chapter: string }>;
}

export async function generateStaticParams() {
  const params: { lang: string; chapter: string }[] = [];

  for (const lang of SUPPORTED_LANGUAGES) {
    const chapters = getChaptersForLanguage(lang);
    for (const ch of chapters) {
      params.push({ lang, chapter: ch.slug });
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps) {
  const { lang, chapter } = await params;

  if (!isValidLanguage(lang) || !chapterExists(lang, chapter)) {
    return { title: 'Not Found' };
  }

  const title = getChapterTitle(lang, chapter);

  return {
    title: `${title} – Pétanque Guiden`,
    description: `${title} på ${LANGUAGE_LABELS[lang]}`,
  };
}

export default async function ChapterPage({ params }: PageProps) {
  const { lang, chapter } = await params;

  if (!isValidLanguage(lang)) {
    notFound();
  }

  const content = getChapterContent(lang, chapter);

  if (!content) {
    notFound();
  }

  const title = getChapterTitle(lang, chapter);
  const chapters = getChaptersForLanguage(lang);
  const currentIndex = chapters.findIndex((ch) => ch.slug === chapter);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  return (
    <>
      {/* Language switcher for this chapter */}
      <div className="lang" style={{ marginBottom: '1rem' }}>
        {SUPPORTED_LANGUAGES.map((l) => {
          const exists = chapterExists(l, chapter);
          if (!exists) return null;
          return (
            <Link
              key={l}
              href={`/guide/${l}/${chapter}`}
              style={l === lang ? { background: '#f0f0f0', fontWeight: 'bold' } : {}}
            >
              {LANGUAGE_FLAGS[l]}
            </Link>
          );
        })}
      </div>

      {/* Chapter content - rendered as HTML */}
      <div dangerouslySetInnerHTML={{ __html: content }} />

      {/* Navigation */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid #eee',
        }}
      >
        {prevChapter ? (
          <Link href={`/guide/${lang}/${prevChapter.slug}`}>
            ← {prevChapter.title}
          </Link>
        ) : (
          <span />
        )}
        {nextChapter ? (
          <Link href={`/guide/${lang}/${nextChapter.slug}`}>
            {nextChapter.title} →
          </Link>
        ) : (
          <span />
        )}
      </div>

      <p className="muted" style={{ marginTop: '1rem', textAlign: 'center' }}>
        <Link href={`/guide/${lang}`}>← Tillbaka till innehåll ({LANGUAGE_LABELS[lang]})</Link>
      </p>
    </>
  );
}
