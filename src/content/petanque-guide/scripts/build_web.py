import os, re, html, pathlib

ROOT = pathlib.Path('.')
SRC = {
  'sv': ROOT/'originals'/'sv',
  'en': ROOT/'translations'/'en',
  'fr': ROOT/'translations'/'fr',
  'es': ROOT/'translations'/'es',
  'de': ROOT/'translations'/'de',
}
OUT = ROOT/'build'/'web'

def parse_frontmatter(p):
    # Läs YAML-frontmatter (enkelt: nyckel: värde)
    text = p.read_text(encoding='utf-8', errors='ignore')
    m = re.match(r'^---\s*\n(.*?)\n---\s*', text, flags=re.S)
    meta = {}
    if m:
        block = m.group(1)
        for line in block.splitlines():
            if ':' in line:
                k, v = line.split(':', 1)
                meta[k.strip()] = v.strip().strip('"').strip("'")
    return meta

def h(s): return html.escape(str(s))

def write_file(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding='utf-8')

STYLE = """
<style>
  body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif;max-width:900px;margin:2rem auto;padding:0 1rem;line-height:1.5}
  h1,h2{margin:0.5rem 0 0.25rem}
  .lang a{display:inline-block;margin:0.25rem 0.5rem;padding:0.5rem 0.8rem;border-radius:8px;border:1px solid #ddd;text-decoration:none;color:#222}
  .card{border:1px solid #eee;border-radius:12px;padding:1rem;margin:0.6rem 0}
  .muted{color:#666;font-size:0.9rem}
  .grid{display:grid;grid-template-columns:1fr;gap:0.6rem}
  .chip{font-size:0.8rem;color:#555;background:#f5f5f5;border:1px solid #eee;border-radius:999px;padding:0.15rem 0.6rem;margin-left:0.4rem}
  a { color:#0b6; }
</style>
"""

def layout(title, body):
    return f"<!doctype html><html lang='sv'><meta charset='utf-8'><title>{h(title)}</title>{STYLE}<body>{body}</body></html>"

def build_language(lang, src_dir):
    items = []
    for p in sorted(src_dir.glob("*.md")):
        meta = parse_frontmatter(p)
        if not meta: continue
        try:
            part = int(meta.get('part','0'))
            chapter = int(meta.get('chapter','0'))
        except ValueError:
            part, chapter = 0, 0
        title = meta.get('title', p.stem)
        items.append((part, chapter, title, p.name, meta))
    items.sort(key=lambda x:(x[0], x[1]))

    # index för språket
    rows = []
    current_part = None
    for part, chapter, title, fname, meta in items:
        if part != current_part:
            rows.append(f"<h2>Del {part}</h2>")
            current_part = part
        url = f"./{fname.replace('.md','.html')}"
        chip = f"<span class='chip'>Kapitel {chapter}</span>"
        rows.append(f"<div class='card'><a href='{url}'><strong>{h(title)}</strong></a> {chip}</div>")
    body = f"<h1>Petanque – Innehåll ({lang.upper()})</h1><p class='muted'>Genererat från Markdown-metadata.</p><div class='grid'>{''.join(rows)}</div><p class='muted'><a href='../index.html'>← Till språkval</a></p>"
    write_file(OUT/lang/'index.html', layout(f"Innehåll ({lang})", body))

    # enkla kapitel-sidor (stubbar)
    for part, chapter, title, fname, meta in items:
        content = f"<h1>{h(title)}</h1><p class='muted'>Språk: {lang.upper()} · Del {part} · Kapitel {chapter}</p><p>Innehåll kommer här (från fil: <code>{h(fname)}</code>).</p><p class='muted'><a href='./index.html'>← Till innehåll</a></p>"
        write_file(OUT/lang/fname.replace('.md','.html'), layout(title, content))

def main():
    # rotindex med språkval
    langs = ['sv','en','fr','es','de']
    links = " ".join([f"<a class='lang' href='./{l}/index.html'>{l.upper()}</a>" for l in langs])
    write_file(OUT/'index.html', layout("Petanque – Språk", f"<h1>Välj språk</h1><div class='lang'>{links}</div><p class='muted'>Byggt lokalt från <code>originals/</code> och <code>translations/</code>.</p>"))
    # per språk
    for l, path in SRC.items():
        build_language(l, path)

if __name__ == "__main__":
    main()
