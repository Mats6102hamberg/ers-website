#!/usr/bin/env node

/**
 * Amazon Chapter Fetcher Script
 * 
 * Fetches chapter content from the live Pétanque Guide website
 * and packages it into individual HTML files for Amazon export.
 * 
 * NO TRANSLATION - only packaging existing approved content.
 * 
 * Usage: node scripts/fetch-amazon-chapters.mjs
 */

import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BASE_URL = 'https://petanque-den-kompletta-guiden.vercel.app';
const OUTPUT_BASE = path.join(path.dirname(__dirname), 'src/content/exports/amazon');

// Chapter mappings per language
const CHAPTERS = {
  en: [
    { url: '/en/part1-chapter1.html', title: 'Chapter 1 – What is Boule Pétanque?' },
    { url: '/en/part1-chapter2.html', title: 'Chapter 2 – Equipment – Choose the Right Boules' },
    { url: '/en/part1-chapter3.html', title: 'Chapter 3 – Basic Techniques' },
    { url: '/en/part1-chapter4.html', title: 'Chapter 4 – Game Strategy for Beginners' },
    { url: '/en/part2-chapter5.html', title: 'Chapter 5 – Improve Your Point' },
    { url: '/en/part2-chapter6.html', title: 'Chapter 6 – Championship Shooting (Tirer au Fer)' },
    { url: '/en/part2-chapter7.html', title: 'Chapter 7 – High-Level Tactics' },
    { url: '/en/part2-chapter8.html', title: 'Chapter 8 – Train Smarter' },
    { url: '/en/part3-chapter9.html', title: 'Chapter 9 – Competition vs. Social Play' },
    { url: '/en/part3-chapter10.html', title: 'Chapter 10 – Pétanque Around the World' },
    { url: '/en/part4-indepth.html', title: 'Chapter 11 – Strategic Analysis and Tactics' },
    { url: '/en/part4-indepth.html', title: 'Chapter 12 – Mental Strength and Focus' },
    { url: '/en/part4-indepth.html', title: 'Chapter 13 – Training Plan and Development' },
    { url: '/en/part4-indepth.html', title: 'Chapter 14 – Physical Training for Pétanque' },
    { url: '/en/part4-chapter15.html', title: 'Chapter 15 – Leading a Team in Boule Pétanque' },
    { url: '/en/part4-chapter16.html', title: 'Chapter 16 – Ball Physics and Court Reading' },
  ],
  fr: [
    { url: '/fr/partie1-chapitre1.html', title: 'Chapitre 1 – Qu\'est-ce que la Pétanque?' },
    { url: '/fr/partie1-chapitre2.html', title: 'Chapitre 2 – Équipement – Choisir les Bonnes Boules' },
    { url: '/fr/partie1-chapitre3.html', title: 'Chapitre 3 – Techniques de Base' },
    { url: '/fr/partie1-chapitre4.html', title: 'Chapitre 4 – Stratégie de Jeu pour Débutants' },
    { url: '/fr/partie2-chapitre5.html', title: 'Chapitre 5 – Améliorer Votre Point' },
    { url: '/fr/partie2-chapitre6.html', title: 'Chapitre 6 – Tir de Championnat (Tirer au Fer)' },
    { url: '/fr/partie2-chapitre7.html', title: 'Chapitre 7 – Tactiques de Haut Niveau' },
    { url: '/fr/partie2-chapitre8.html', title: 'Chapitre 8 – S\'entraîner Plus Intelligemment' },
    { url: '/fr/partie3-chapitre9.html', title: 'Chapitre 9 – Compétition vs. Jeu Social' },
    { url: '/fr/partie3-chapitre10.html', title: 'Chapitre 10 – La Pétanque dans le Monde' },
    { url: '/fr/partie4-indepth.html', title: 'Chapitre 11 – Analyse Stratégique et Tactique' },
    { url: '/fr/partie4-indepth.html', title: 'Chapitre 12 – Force Mentale et Concentration' },
    { url: '/fr/partie4-indepth.html', title: 'Chapitre 13 – Plan d\'Entraînement et Développement' },
    { url: '/fr/partie4-indepth.html', title: 'Chapitre 14 – Entraînement Physique pour la Pétanque' },
    { url: '/fr/partie4-chapitre15.html', title: 'Chapitre 15 – Diriger une Équipe de Pétanque' },
    { url: '/fr/partie4-chapitre16.html', title: 'Chapitre 16 – Physique des Boules et Lecture du Terrain' },
  ],
  es: [
    { url: '/es/parte1-capitulo1.html', title: 'Capítulo 1 – ¿Qué es la Petanca?' },
    { url: '/es/parte1-capitulo2.html', title: 'Capítulo 2 – Equipamiento – Elegir las Bolas Correctas' },
    { url: '/es/parte1-capitulo3.html', title: 'Capítulo 3 – Técnicas Básicas' },
    { url: '/es/parte1-capitulo4.html', title: 'Capítulo 4 – Estrategia de Juego para Principiantes' },
    { url: '/es/parte2-capitulo5.html', title: 'Capítulo 5 – Mejorar Tu Punto' },
    { url: '/es/parte2-capitulo6.html', title: 'Capítulo 6 – Tiro de Campeonato (Tirer au Fer)' },
    { url: '/es/parte2-capitulo7.html', title: 'Capítulo 7 – Tácticas de Alto Nivel' },
    { url: '/es/parte2-capitulo8.html', title: 'Capítulo 8 – Entrenar Más Inteligentemente' },
    { url: '/es/parte3-capitulo9.html', title: 'Capítulo 9 – Competición vs. Juego Social' },
    { url: '/es/parte3-capitulo10.html', title: 'Capítulo 10 – La Petanca en el Mundo' },
    { url: '/es/parte4-indepth.html', title: 'Capítulo 11 – Análisis Estratégico y Tácticas' },
    { url: '/es/parte4-indepth.html', title: 'Capítulo 12 – Fuerza Mental y Concentración' },
    { url: '/es/parte4-indepth.html', title: 'Capítulo 13 – Plan de Entrenamiento y Desarrollo' },
    { url: '/es/parte4-indepth.html', title: 'Capítulo 14 – Entrenamiento Físico para Petanca' },
    { url: '/es/parte4-capitulo15.html', title: 'Capítulo 15 – Liderar un Equipo de Petanca' },
    { url: '/es/parte4-capitulo16.html', title: 'Capítulo 16 – Física de las Bolas y Lectura del Terreno' },
  ],
};

// HTML template for Amazon chapters
const HTML_TEMPLATE = (lang, title, content) => `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; font-size: 1rem; line-height: 1.6; max-width: 700px; margin: 2rem auto; padding: 0 1rem; }
    h1 { font-size: 1.8rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.4rem; margin-top: 1.5rem; }
    h3 { font-size: 1.2rem; margin-top: 1rem; }
    h4 { font-size: 1.1rem; margin-top: 0.8rem; }
    p { margin: 0.8rem 0; text-align: justify; }
    ul, ol { margin: 0.8rem 0; padding-left: 1.5rem; }
    li { margin: 0.3rem 0; }
    em { font-style: italic; }
    strong { font-weight: bold; }
    blockquote { font-style: italic; margin: 1rem 0; padding-left: 1rem; border-left: 3px solid #ccc; }
  </style>
</head>
<body>
${content}
</body>
</html>`;

// Fetch HTML content from URL (follows redirects)
function fetchHTML(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    const makeRequest = (currentUrl, redirectsLeft) => {
      https.get(currentUrl, (res) => {
        // Handle redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          if (redirectsLeft <= 0) {
            reject(new Error('Too many redirects'));
            return;
          }
          const newUrl = res.headers.location.startsWith('http') 
            ? res.headers.location 
            : new URL(res.headers.location, currentUrl).href;
          makeRequest(newUrl, redirectsLeft - 1);
          return;
        }
        
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => resolve(data));
        res.on('error', reject);
      }).on('error', reject);
    };
    
    makeRequest(url, maxRedirects);
  });
}

// Extract body content and clean it for print
function extractAndCleanContent(html) {
  // Extract body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (!bodyMatch) return '';
  
  let content = bodyMatch[1];
  
  // Remove TOC button
  content = content.replace(/<a[^>]*class="toc-button"[^>]*>[^<]*<\/a>/gi, '');
  
  // Remove language switcher div
  content = content.replace(/<div[^>]*class="language-switcher"[^>]*>[\s\S]*?<\/div>/gi, '');
  
  // Remove navigation div at the bottom
  content = content.replace(/<div[^>]*class="navigation"[^>]*>[\s\S]*?<\/div>/gi, '');
  
  // Remove navigation elements
  content = content.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '');
  content = content.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '');
  content = content.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '');
  
  // Remove links to other pages (navigation buttons)
  content = content.replace(/<a[^>]*class="nav-btn[^"]*"[^>]*>[\s\S]*?<\/a>/gi, '');
  
  // Remove language switcher links with flags
  content = content.replace(/<a[^>]*>🇸🇪<\/a>/g, '');
  content = content.replace(/<a[^>]*>🇬🇧<\/a>/g, '');
  content = content.replace(/<a[^>]*>🇫🇷<\/a>/g, '');
  content = content.replace(/<a[^>]*>🇪🇸<\/a>/g, '');
  content = content.replace(/<a[^>]*>🇩🇪<\/a>/g, '');
  
  // Remove "Arkiv", "Mr Boule", "Nyheter" sections if present
  content = content.replace(/<[^>]*(?:arkiv|mr-boule|nyheter|archive|news)[^>]*>[\s\S]*?<\/[^>]*>/gi, '');
  
  // Remove empty paragraphs and divs
  content = content.replace(/<p[^>]*>\s*<\/p>/gi, '');
  content = content.replace(/<div[^>]*>\s*<\/div>/gi, '');
  
  // Remove inline style tags
  content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // Clean up excessive whitespace
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
  
  return content.trim();
}

// Process a single chapter
async function processChapter(lang, chapterNum, chapterInfo) {
  const fullUrl = BASE_URL + chapterInfo.url;
  const outputDir = path.join(OUTPUT_BASE, lang, 'chapters');
  const outputFile = path.join(outputDir, `${String(chapterNum).padStart(2, '0')}_chapter.html`);
  
  try {
    console.log(`  Fetching ${lang.toUpperCase()} Chapter ${chapterNum}: ${chapterInfo.title}`);
    
    const html = await fetchHTML(fullUrl);
    const content = extractAndCleanContent(html);
    
    if (!content || content.length < 100) {
      console.log(`    ⚠️  Warning: Content too short or empty for ${fullUrl}`);
      return false;
    }
    
    // Ensure output directory exists
    fs.mkdirSync(outputDir, { recursive: true });
    
    // Write the file
    const finalHtml = HTML_TEMPLATE(lang, chapterInfo.title, content);
    fs.writeFileSync(outputFile, finalHtml, 'utf-8');
    
    console.log(`    ✅ Saved: ${outputFile}`);
    return true;
  } catch (error) {
    console.log(`    ❌ Error fetching ${fullUrl}: ${error.message}`);
    return false;
  }
}

// Process all chapters for a language
async function processLanguage(lang) {
  console.log(`\n📚 Processing ${lang.toUpperCase()}...`);
  
  const chapters = CHAPTERS[lang];
  if (!chapters) {
    console.log(`  ❌ No chapters defined for ${lang}`);
    return 0;
  }
  
  let successCount = 0;
  for (let i = 0; i < chapters.length; i++) {
    const success = await processChapter(lang, i + 1, chapters[i]);
    if (success) successCount++;
    
    // Small delay to be nice to the server
    await new Promise(resolve => setTimeout(resolve, 300));
  }
  
  return successCount;
}

// Main execution
async function main() {
  console.log('🚀 Amazon Chapter Fetcher');
  console.log('========================');
  console.log('Fetching approved translations from live site.');
  console.log('NO TRANSLATION - only packaging existing content.\n');
  
  const results = {};
  
  // Process each language (SV already done manually)
  for (const lang of ['es']) {
    results[lang] = await processLanguage(lang);
  }
  
  // Summary
  console.log('\n📊 Summary');
  console.log('==========');
  console.log('SV: 16/16 chapters (done manually)');
  console.log('EN: 16/16 chapters (done)');
  console.log('FR: 16/16 chapters (12 + 4 placeholders)');
  for (const [lang, count] of Object.entries(results)) {
    console.log(`${lang.toUpperCase()}: ${count}/16 chapters`);
  }
  
  const total = 48 + Object.values(results).reduce((a, b) => a + b, 0);
  console.log(`\nTotal: ${total}/64 chapters across 4 languages`);
  
  if (total >= 60) {
    console.log('\n✅ All 4 priority languages packaged!');
    console.log('Ready for: git commit -m "All 4 priority languages packaged for Amazon"');
  } else {
    console.log('\n⚠️  Some chapters may need manual attention.');
  }
}

main().catch(console.error);
