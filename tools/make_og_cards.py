"""Render the Open Graph cards under assets/og/ from their SVG definitions.

Each card is drawn here as inline SVG and rasterized with headless Chrome, so
the typography matches the site (the self-hosted woff2 files are loaded via
@font-face) and every card is exactly 1200x630.

Usage:
    python tools/make_og_cards.py

Requires Google Chrome and Python 3. This script is optional tooling: the
site serves the committed PNGs directly and has no build step.
"""
import html
import shutil
import subprocess
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
FONTS = REPO / "assets" / "fonts"
OUTDIR = REPO / "assets" / "og"

CHROME_CANDIDATES = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
]

BG_A, BG_B = "#090b0f", "#111722"
AMBER, CYAN, WHITE = "#ff9f2e", "#35d4f4", "#f3f4f6"
DIM, MUTED = "#9aa5b5", "#78859a"

TITLE_X = 88
TITLE_MAXW = 690
SUB_MAXW = 660
BLOCK_X, BLOCK_Y, BLOCK_S = 860, 195, 240

CARDS = [
    {
        "slug": "onnx-browser-ml-inference",
        "index": "NO. 03",
        "eyebrow": "ML SYSTEMS / ONNX RUNTIME WEB",
        "title": ["Debugging Browser-Based", "ML Inference"],
        "subtitle": [
            "A batched ONNX input silently corrupted every tile it",
            "touched — and looked like a model that was merely unsure.",
        ],
        "footer": "PAVAN GANESH INDUPUDI  ·  13 MIN READ  ·  2026-10-21",
    },
    {
        "slug": "privyse-browser-agent",
        "index": "NO. 01",
        "eyebrow": "PRIVACY ENGINEERING / BROWSER AGENTS",
        "title": ["Building PRIVYSE", "A Privacy-First Browser Agent"],
        "subtitle": [
            "On-device sanitization, a fail-closed zero-leak gate, and",
            "the two defects we documented instead of burying.",
        ],
        "footer": "PAVAN GANESH INDUPUDI  ·  12 MIN READ  ·  2026-10-19",
    },
    {
        "slug": "voice-rag-grounded-answers",
        "index": "NO. 02",
        "eyebrow": "RAG / MULTILINGUAL SPEECH",
        "title": ["Inside VOICE-RAG", "Speech to Grounded Answers"],
        "subtitle": [
            "Calibrated per-language refusal floors over a",
            "40,000-passage corpus, and a 56 ms retrieval core.",
        ],
        "footer": "PAVAN GANESH INDUPUDI  ·  9 MIN READ  ·  2026-10-19",
    },
]


def find_chrome():
    for candidate in CHROME_CANDIDATES:
        if Path(candidate).exists():
            return candidate
    raise SystemExit("Google Chrome not found; install it or edit CHROME_CANDIDATES.")


def font_face(family, path, weight="200 800"):
    return (
        f"@font-face{{font-family:'{family}';font-style:normal;"
        f"font-weight:{weight};src:url('{path.as_uri()}') format('woff2');}}"
    )


def build_html(card):
    faces = "".join(
        [
            font_face("Space Grotesk", FONTS / "space-grotesk-var.woff2"),
            font_face("Inter", FONTS / "inter-var.woff2"),
            font_face("JetBrains Mono", FONTS / "jetbrains-mono-var.woff2"),
        ]
    )

    title_lines = "".join(
        f'<text class="fit" data-maxw="{TITLE_MAXW}" x="{TITLE_X}" y="{268 + i * 62}" '
        f'fill="{WHITE}" font-family="Space Grotesk" font-size="52" font-weight="700">'
        f"{html.escape(t)}</text>"
        for i, t in enumerate(card["title"])
    )
    sub_lines = "".join(
        f'<text class="fit" data-maxw="{SUB_MAXW}" x="{TITLE_X}" y="{392 + i * 30}" '
        f'fill="{DIM}" font-family="Inter" font-size="22" font-weight="400">'
        f"{html.escape(t)}</text>"
        for i, t in enumerate(card["subtitle"])
    )

    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop stop-color="{BG_A}"/><stop offset="1" stop-color="{BG_B}"/>
    </linearGradient>
    <radialGradient id="glow">
      <stop stop-color="{AMBER}" stop-opacity=".20"/><stop offset="1" stop-color="{AMBER}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="960" cy="300" r="380" fill="url(#glow)"/>
  <g stroke="{AMBER}" stroke-opacity=".20" fill="none">
    <ellipse cx="980" cy="315" rx="215" ry="152" transform="rotate(-22 980 315)"/>
    <ellipse cx="980" cy="315" rx="152" ry="224" transform="rotate(38 980 315)"/>
  </g>
  <g stroke="{CYAN}" stroke-opacity=".10" fill="none">
    <path d="M0 560H1200M0 92H1200" stroke-dasharray="2 14"/>
  </g>

  <text x="{TITLE_X}" y="128" fill="{CYAN}" font-family="JetBrains Mono" font-size="16" letter-spacing="5">INFERNIX ENGINEERING JOURNAL</text>
  <text x="{TITLE_X}" y="182" fill="{AMBER}" font-family="JetBrains Mono" font-size="18" letter-spacing="4">{html.escape(card["eyebrow"])}</text>

  {title_lines}
  {sub_lines}

  <path d="M{TITLE_X} 440H{TITLE_X + 620}" stroke="#1f2836"/>
  <text x="{TITLE_X}" y="478" fill="{MUTED}" font-family="JetBrains Mono" font-size="15" letter-spacing="1.5">{html.escape(card["footer"])}</text>
  <text x="{TITLE_X}" y="528" fill="{MUTED}" font-family="JetBrains Mono" font-size="15" letter-spacing="2">THE-INFERNIX.GITHUB.IO</text>

  <rect x="{BLOCK_X}" y="{BLOCK_Y}" width="{BLOCK_S}" height="{BLOCK_S}" fill="#0e131c" stroke="#2b3646"/>
  <text x="{BLOCK_X + BLOCK_S // 2}" y="{BLOCK_Y + 108}" fill="{WHITE}" font-family="JetBrains Mono" font-size="120" font-weight="bold" text-anchor="middle">I<tspan fill="{AMBER}">.</tspan></text>
  <text x="{BLOCK_X + BLOCK_S // 2}" y="{BLOCK_Y + 152}" fill="{DIM}" font-family="JetBrains Mono" font-size="16" letter-spacing="6" text-anchor="middle">INFERNIX</text>
  <path d="M{BLOCK_X + 40} {BLOCK_Y + 180}H{BLOCK_X + BLOCK_S - 40}" stroke="#2b3646"/>
  <text x="{BLOCK_X + BLOCK_S // 2}" y="{BLOCK_Y + 212}" fill="{AMBER}" font-family="JetBrains Mono" font-size="16" letter-spacing="4" text-anchor="middle">{html.escape(card["index"])}</text>
</svg>"""

    return f"""<!doctype html>
<html><head><meta charset="utf-8"><style>
{faces}
html,body{{margin:0;padding:0;background:{BG_A};width:1200px;height:630px;overflow:hidden}}
svg{{display:block}}
</style></head>
<body>
{svg}
<script>
(async () => {{
  await document.fonts.ready;
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  for (const el of document.querySelectorAll('text.fit')) {{
    const maxw = parseFloat(el.dataset.maxw);
    let size = parseFloat(el.getAttribute('font-size'));
    const min = size * 0.62;
    let guard = 0;
    while (el.getComputedTextLength() > maxw && size > min && guard++ < 200) {{
      size -= 0.5;
      el.setAttribute('font-size', size);
    }}
  }}
}})();
</script>
</body></html>"""


def main():
    chrome = find_chrome()
    OUTDIR.mkdir(parents=True, exist_ok=True)
    work = Path(tempfile.mkdtemp(prefix="og-cards-"))
    try:
        for card in CARDS:
            wrapper = work / f"{card['slug']}.html"
            wrapper.write_text(build_html(card), encoding="utf-8")
            png = OUTDIR / f"{card['slug']}.png"
            subprocess.run(
                [
                    chrome,
                    "--headless",
                    "--disable-gpu",
                    "--hide-scrollbars",
                    "--force-device-scale-factor=1",
                    "--window-size=1200,630",
                    "--virtual-time-budget=5000",
                    f"--screenshot={png}",
                    f"--user-data-dir={work / 'cdp'}",
                    wrapper.as_uri(),
                ],
                check=False,
                capture_output=True,
            )
            shutil.rmtree(work / "cdp", ignore_errors=True)
            if not png.exists():
                raise SystemExit(f"render failed for {card['slug']}")
            print(f"{png.relative_to(REPO)}  {png.stat().st_size / 1024:.1f} KB")
    finally:
        shutil.rmtree(work, ignore_errors=True)


if __name__ == "__main__":
    main()
