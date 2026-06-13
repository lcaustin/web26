Parse a praise team sheet music PDF from `./pdf/` and produce slide-ready bilingual lyrics for Proclaim.

**Argument:** filename under `./pdf/` (e.g. `/parse-sheet-music 26년 6월 찬양.pdf`)

## Steps

1. Open `./pdf/$ARGUMENTS` with the Read tool. If no argument was given, list all PDFs in `./pdf/` and ask the user which one to parse.

2. From the PDF content, extract ALL songs. Each song has:
   - **title** — Korean song title
   - **arrangement** — the red sequence at the top (e.g. `Intro(8마디)-V1-C1-Inter1(4마디)-V2-C1-후주`)
   - **notes** — special instructions (lines prefixed with `*`)
   - **sections** — lyrics grouped by section label (V1, V2, C1, C2, PC, B/Bx, Inter, Inter1, Inter2, Intro, Outro, 후주)

3. For each song, find English lyrics:
   - Search your knowledge for the **official English version** by title
   - If no official version exists, produce a natural worship-appropriate **English translation**
   - Match section labels and line count to Korean as closely as possible
   - Mark `"source": "official"` or `"source": "translated"` accordingly

4. **Official title enrichment (interactive):**
   - After extracting all songs, list every song where `englishSource` is `"translated"` — these are songs where no official English version was found
   - For each one, ask the user: *"Do you know the official English title for '[Korean title]'? (or press Enter to skip)"*
   - If the user provides a title (e.g. `This Is Amazing Grace (Phil Wickham)`):
     - Use WebSearch to find the official English lyrics for that song, section by section
     - Replace the translated English with the official lyrics
     - Update `englishTitle` and set `englishSource` to `"official"`
     - Rebuild the `slideData` for that song with the new English, keeping 2 Korean lines per slide
   - If the user skips, keep the translation as-is

5. Split lyrics into **slides of 2 short Korean lines** each:
   - Pair each slide with matching English lines
   - English color is `#FFD900` (yellowish) for Proclaim

6. Write output to `./pdf/output/`:
   - `<filename>.json` — full structured data
   - `<filename>.md` — human-readable preview

## Slide JSON format

```json
{
  "ko": "완전하신 사랑 나의죄위하여\n십자가지신주 생명을주시고",
  "en": "Perfect love, for all my sin\nThe cross you bore, gave life within",
  "enColor": "#FFD900"
}
```

## Output JSON structure

```json
{
  "filename": "26년 6월 12,14일 찬양.pdf",
  "date": "2026-06-12,14",
  "songs": [
    {
      "title": "놀라우신 은혜",
      "englishTitle": "This Is Amazing Grace (Phil Wickham)",
      "englishSource": "official",
      "arrangement": "Intro(8마디)-V1-C1-Inter1(4마디)-V2-C1-Inter2(4마디)-Bx3-C2x2-후주",
      "notes": ["영상과 흐름이 같습니다"],
      "sections": { "V1": "Korean lyrics...", "C1": "Korean chorus..." },
      "englishSections": { "V1": "English lyrics...", "C1": "English chorus..." },
      "slideData": [
        {
          "section": "V1",
          "slides": [
            { "ko": "line1\nline2", "en": "line1\nline2", "enColor": "#FFD900" }
          ]
        }
      ]
    }
  ]
}
```

## Section label reference

| Label | Meaning |
|-------|---------|
| V, V1, V2, V3 | Verse |
| C, C1, C2 | Chorus |
| B, Bx | Bridge |
| PC | Pre-Chorus |
| Inter, Inter1, Inter2 | Interlude |
| Intro, Outro, 후주 | Intro / Outro |

## Notes

- English marked `"source": "translated"` means no official lyrics found — these are candidates for enrichment
- `slideData` is the direct input for the Proclaim slide generator
- Run from project root: `/Users/aj/Projects/LC/web26`
