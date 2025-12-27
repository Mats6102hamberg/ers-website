/**
 * Legacy Layout for Petanque Guide
 * 
 * This layout is completely isolated from the main Tailwind 4 design.
 * It uses the original inline CSS from the book build to preserve
 * the exact design without any interference.
 */

import { ReactNode } from 'react';

export const metadata = {
  title: 'Pétanque – Den kompletta Guiden',
  description: 'Webb-boken med 16 kapitel på 6 språk',
};

export default function PetanqueLegacyLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            /* Original Petanque Guide CSS - Isolated from Tailwind */
            .petanque-guide {
              font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
              max-width: 900px;
              margin: 2rem auto;
              padding: 0 1rem;
              line-height: 1.5;
              background: #fff;
              color: #222;
            }
            .petanque-guide h1, .petanque-guide h2 {
              margin: 0.5rem 0 0.25rem;
            }
            .petanque-guide .lang a {
              display: inline-block;
              margin: 0.25rem 0.5rem;
              padding: 0.5rem 0.8rem;
              border-radius: 8px;
              border: 1px solid #ddd;
              text-decoration: none;
              color: #222;
            }
            .petanque-guide .lang a:hover {
              background: #f5f5f5;
            }
            .petanque-guide .card {
              border: 1px solid #eee;
              border-radius: 12px;
              padding: 1rem;
              margin: 0.6rem 0;
            }
            .petanque-guide .muted {
              color: #666;
              font-size: 0.9rem;
            }
            .petanque-guide .grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 0.6rem;
            }
            .petanque-guide .chip {
              font-size: 0.8rem;
              color: #555;
              background: #f5f5f5;
              border: 1px solid #eee;
              border-radius: 999px;
              padding: 0.15rem 0.6rem;
              margin-left: 0.4rem;
            }
            .petanque-guide a {
              color: #0b6;
            }
            .petanque-guide a:hover {
              text-decoration: underline;
            }
          `,
        }}
      />
      <div className="petanque-guide">{children}</div>
    </>
  );
}
