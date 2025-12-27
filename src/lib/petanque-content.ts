/**
 * Petanque Guide Content Utilities
 * 
 * Reads pre-built HTML content from the petanque-guide build folder
 * and extracts body content for rendering in Next.js.
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const CONTENT_BASE = join(process.cwd(), 'src/content/petanque-guide/build/web');

export const SUPPORTED_LANGUAGES = ['sv', 'en', 'fr', 'es', 'de'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  sv: 'Svenska',
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
};

export const LANGUAGE_FLAGS: Record<SupportedLanguage, string> = {
  sv: '🇸🇪',
  en: '🇬🇧',
  fr: '🇫🇷',
  es: '🇪🇸',
  de: '🇩🇪',
};

export interface ChapterInfo {
  slug: string;
  title: string;
  language: SupportedLanguage;
}

/**
 * Get list of all chapters for a given language
 */
export function getChaptersForLanguage(lang: SupportedLanguage): ChapterInfo[] {
  const langDir = join(CONTENT_BASE, lang);
  
  if (!existsSync(langDir)) {
    return [];
  }

  const files = readdirSync(langDir).filter(f => f.endsWith('.html') && f !== 'index.html');
  
  return files.map(file => {
    const slug = file.replace('.html', '');
    const content = readFileSync(join(langDir, file), 'utf-8');
    const titleMatch = content.match(/<title>([^<]+)<\/title>/);
    const title = titleMatch ? titleMatch[1] : slug;
    
    return { slug, title, language: lang };
  }).sort((a, b) => {
    // Sort by chapter number if present
    const aNum = parseInt(a.slug.split('-')[0]) || 99;
    const bNum = parseInt(b.slug.split('-')[0]) || 99;
    return aNum - bNum;
  });
}

/**
 * Get the HTML body content for a specific chapter
 */
export function getChapterContent(lang: SupportedLanguage, slug: string): string | null {
  const filePath = join(CONTENT_BASE, lang, `${slug}.html`);
  
  if (!existsSync(filePath)) {
    return null;
  }

  const html = readFileSync(filePath, 'utf-8');
  
  // Extract body content (everything between <body> and </body>)
  const bodyMatch = html.match(/<body>([^]*)<\/body>/);
  
  if (bodyMatch) {
    return bodyMatch[1];
  }
  
  return null;
}

/**
 * Get chapter title from HTML file
 */
export function getChapterTitle(lang: SupportedLanguage, slug: string): string {
  const filePath = join(CONTENT_BASE, lang, `${slug}.html`);
  
  if (!existsSync(filePath)) {
    return slug;
  }

  const html = readFileSync(filePath, 'utf-8');
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  
  return titleMatch ? titleMatch[1] : slug;
}

/**
 * Check if a language is supported
 */
export function isValidLanguage(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}

/**
 * Check if a chapter exists for a given language
 */
export function chapterExists(lang: SupportedLanguage, slug: string): boolean {
  const filePath = join(CONTENT_BASE, lang, `${slug}.html`);
  return existsSync(filePath);
}
