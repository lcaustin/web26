---
name: worship-flow-lyrics
description: Extract Korean worship lyrics and arrangement instructions from worship sheet PDFs, slide-exported sheet music, or copied flow notes, then produce a singer/projection-ready lyric run sheet. Use when the user asks to parse worship sheet music, extract Korean lyrics, arrange lyrics by flow data, expand worship flows such as Intro-V1-C-C or A-B-C, rename compact section labels to Verse/Chorus/Tag, use comma-separated flow notation, or enforce a maximum number of lyric lines per section.
---

# Worship Flow Lyrics

## Goal

Produce an arranged worship lyric run sheet from sheet music or flow notes. Preserve the worship leader's flow exactly, but make it readable for singers and projection operators.

## Workflow

1. Extract source material.
   - For PDFs, render pages visually and extract embedded text when available.
   - Prefer visual inspection for sheet music; embedded text may miss small lyrics or layout-specific flow notes.
   - Capture song titles, flow strings, tempo/key notes, special instructions, and visible lyrics.

2. Build a section map.
   - Convert compact labels to readable labels:
     - `A` -> `Verse 1`
     - `B` -> `Verse 2`
     - `C` -> `Chorus`
     - `D` -> `Tag` unless the page clearly identifies it otherwise
     - `V1`, `V2`, `V3`, `V4` -> `Verse 1`, `Verse 2`, `Verse 3`, `Verse 4`
     - `C1`, `C2` -> `Chorus 1`, `Chorus 2`
   - If a song uses a different printed meaning, follow the sheet.
   - Do not invent lyrics for sections that are mentioned in flow notes but not visible. Mark them `가사 미확인`.

3. Expand the flow into actual lyric order.
   - Repeat sections exactly as written, such as `Chorus x2`, `Tag x3`, or repeated `Chorus, Chorus`.
   - Include non-sung actions as their own lines: `Intro - instrumental`, `간주 - 4마디`, `8마디 - instrumental`, `통성기도`, `박수`, `후주 - instrumental`.
   - Preserve performance notes in headings where relevant: `Chorus - 목소리`, `Chorus - 제창`.

4. Format flow data.
   - Use commas between flow items, not hyphens.
   - Example: `Flow: Intro, Verse 1, Chorus, 간주(4마디), Verse 2, Chorus, Chorus - 목소리, 박수`

5. Limit lyric sections.
   - Maximum line per sung section is 2 lyric lines.
   - If a verse or chorus has more than 2 lyric lines, repeat the same section heading and continue the lyrics.
   - Instrumental/action lines do not count as lyric sections.

## Output Shape

Use this structure:

```markdown
# Arranged Lyrics By Flow

## 1. Song Title

Flow: Intro, Verse 1, Chorus, Chorus, Tag x2

Intro - instrumental

Verse 1
line 1
line 2

Verse 1
line 3

Chorus
line 1
line 2

Chorus
line 3
line 4
```

## Quality Rules

- Keep Korean lyrics in Korean; do not translate unless requested.
- Preserve exact repeat order from the flow data.
- Prefer clear worship-facing labels over source shorthand.
- Keep a maximum of 2 lyric lines after any `Verse`, `Chorus`, or `Tag` heading.
- Use comma-separated `Flow:` and `Flow placement:` lines.
- Flag uncertainty directly with `가사 미확인` or a short note.
- Save user-facing deliverables as Markdown unless the user asks for another format.

## Helper Script

Use `scripts/format_flow_lyrics.py` to normalize a draft Markdown file:

```bash
python scripts/format_flow_lyrics.py input.md output.md
```

The script converts common compact labels, changes hyphen-separated `Flow:` lines to comma-separated flow lines, and validates that sung sections have no more than 2 lyric lines. Review the output manually afterward; the script cannot infer missing lyrics or correct OCR mistakes.
