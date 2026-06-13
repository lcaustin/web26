/**
 * Generate a Proclaim .prs restore file from parsed song JSON.
 *
 * Usage:
 *   pnpm generate-prs                        # uses pdf/20260612-song-template.prs + pdf/output/*.json
 *   pnpm generate-prs "26년 6월 12,14일 찬양"  # specific JSON file (partial name match)
 *
 * Output: pdf/output/<filename>.prs
 *
 * How it works:
 *   - Uses the template .prs as a base (carries over backgrounds, fonts, media)
 *   - Replaces BackupPresentation.json with generated song items
 *   - Each song → one SongLyrics service item
 *   - Korean lines: plain paragraphs
 *   - English lines: paragraphs with FontColor="FFF9F79C" (yellow)
 *   - Empty paragraph = slide break within a section
 */

import AdmZip from 'adm-zip';
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { randomUUID } from 'crypto';

// ── Types ────────────────────────────────────────────────────────────────────

interface Slide {
  ko: string;
  en: string;
  enColor: string;
}

interface SongSlides {
  section: string;
  slides: Slide[];
}

interface Song {
  title: string;
  englishTitle: string;
  englishSource: string;
  arrangement: string;
  notes: string[];
  slideData: SongSlides[];
}

interface ParseResult {
  filename: string;
  date: string;
  songs: Song[];
}

// ── Section name mapping (our labels → Proclaim names) ───────────────────────

const SECTION_NAME_MAP: Record<string, string> = {
  V: 'Verse 1',
  V1: 'Verse 1',
  V2: 'Verse 2',
  V3: 'Verse 3',
  V4: 'Verse 4',
  C: 'Chorus',
  C1: 'Chorus',
  C2: 'Chorus 2',
  C3: 'Chorus 3',
  B: 'Bridge',
  Bx: 'Bridge',
  B2: 'Bridge 2',
  Bx2: 'Bridge 2',
  PC: 'Pre-Chorus',
  Inter: 'Interlude',
  Inter1: 'Interlude',
  Inter2: 'Interlude',
};

// Sections with no lyrics — map to "Blank" in the order sequence
const INSTRUMENTAL_PREFIXES = ['Intro', 'Inter', '후주', 'Outro'];

function toProclaimName(label: string): string {
  return SECTION_NAME_MAP[label] ?? label;
}

function isInstrumental(label: string): boolean {
  return INSTRUMENTAL_PREFIXES.some((p) => label.startsWith(p));
}

// ── XML helpers ───────────────────────────────────────────────────────────────

// Korean chars are full-width (≈2 Latin chars wide).
// Different limits per language:
//   Korean: ~15 Korean chars per line → MAX_VISUAL_KO = 30
//   English: ~26 Latin chars per line → MAX_VISUAL_EN = 26
const MAX_VISUAL_KO = 30;
const MAX_VISUAL_EN = 25; // short English lines → larger font → less dense
const MAX_LINES_KO = 2;
const MAX_LINES_EN = 2;  // 2 short EN lines from first lyric line → 2 KO + 2 EN = 4 total

function visualLen(text: string): number {
  let len = 0;
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    // Hangul syllables/Jamo, CJK Unified Ideographs
    len += (cp >= 0xAC00 && cp <= 0xD7FF) || (cp >= 0x4E00 && cp <= 0x9FFF) ? 2 : 1;
  }
  return len;
}

function hasKorean(text: string): boolean {
  return /[\uAC00-\uD7FF]/.test(text);
}

function wrapLine(text: string): string[] {
  const isKo = hasKorean(text);
  const maxVisual = isKo ? MAX_VISUAL_KO : MAX_VISUAL_EN;
  const maxLines = isKo ? MAX_LINES_KO : MAX_LINES_EN;
  const words = text.split(' ');

  // Build cumulative visual lengths (including spaces between words)
  const cumul: number[] = [];
  let acc = 0;
  for (let i = 0; i < words.length; i++) {
    if (i > 0) acc += 1; // space
    acc += visualLen(words[i]);
    cumul.push(acc);
  }
  const total = cumul[cumul.length - 1];
  if (total <= maxVisual) return [text];

  const n = Math.min(Math.ceil(total / maxVisual), maxLines);

  // For each of the n-1 split points, find the word boundary closest to k*total/n
  const lines: string[] = [];
  let wordStart = 0;
  for (let k = 1; k < n; k++) {
    const splitTarget = total * k / n;
    let bestIdx = wordStart;
    let bestDiff = Infinity;
    for (let i = wordStart; i < words.length - 1; i++) {
      const diff = Math.abs(cumul[i] - splitTarget);
      if (diff < bestDiff) { bestDiff = diff; bestIdx = i; }
      else break; // past the closest point
    }
    lines.push(words.slice(wordStart, bestIdx + 1).join(' '));
    wordStart = bestIdx + 1;
  }
  lines.push(words.slice(wordStart).join(' '));
  return lines;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const EMPTY_PARA = `<Paragraph Language="en-US" Margin="0,0,0,0" />`;

function koPara(text: string): string {
  return `<Paragraph Language="en-US" Margin="0,0,0,0"><Run Text="${escapeXml(text)}" /></Paragraph>`;
}

function enPara(text: string): string {
  return `<Paragraph Language="en-US" Margin="0,0,0,0"><Run FontColor="FFF9F79C" Text="${escapeXml(text)}" /></Paragraph>`;
}

// ── Lyrics XML generator ──────────────────────────────────────────────────────

function buildLyricsXml(slideData: SongSlides[]): string {
  const parts: string[] = [];

  for (const section of slideData) {
    const sectionName = toProclaimName(section.section);
    parts.push(koPara(sectionName)); // section header label

    for (const slide of section.slides) {
      // Korean: join all lines into one text, wrap as a unit (target 2 lines, max 3)
      const koText = slide.ko.split('\n').map((l) => l.trim()).filter(Boolean).join(' ');
      for (const wrapped of wrapLine(koText)) parts.push(koPara(wrapped));

      // English (yellow): split each lyric line into short paragraphs (~25 chars),
      // cap total at MAX_LINES_EN. Short lines allow Proclaim to use larger font.
      const enLines = slide.en.split('\n').map((l) => l.trim()).filter(Boolean);
      const enParas: string[] = [];
      for (const line of enLines) {
        for (const wrapped of wrapLine(line)) enParas.push(enPara(wrapped));
        if (enParas.length >= MAX_LINES_EN) break;
      }
      for (const para of enParas.slice(0, MAX_LINES_EN)) parts.push(para);

      parts.push(EMPTY_PARA); // slide break within a section
    }
  }

  return parts.join('');
}

// ── CustomOrderSequence builder ───────────────────────────────────────────────

function buildOrderSequence(arrangement: string, slideData: SongSlides[]): string {
  // Build a set of known section labels with their Proclaim names
  const knownLabels = slideData.map((s) => s.section);
  // Sort longest first so "C2" matches before "C"
  knownLabels.sort((a, b) => b.length - a.length);

  const order: string[] = ['Blank'];

  // Split arrangement on dashes; e.g. "Intro(8마디)-V1-C1-Bx3-C2x2-후주"
  const segments = arrangement.split('-');

  for (const seg of segments) {
    // Strip parenthetical notes like "(8마디)"
    const clean = seg.replace(/\(.*?\)/g, '').trim();
    if (!clean) continue;

    // Check if instrumental
    if (isInstrumental(clean)) continue;

    // Try to match a known section label (prefix match)
    const matched = knownLabels.find((lbl) => clean.startsWith(lbl));

    if (matched) {
      const remainder = clean.slice(matched.length); // e.g. "3" from "Bx3", "x2" from "C2x2", "" from "V1"
      const repeat = parseInt(remainder.replace(/^x/i, '') || '1');
      const name = toProclaimName(matched);
      for (let i = 0; i < repeat; i++) order.push(name);
    }
    // Unknown segments are silently skipped
  }

  order.push('Blank');
  return order.join(', ');
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const templatePath = path.resolve('pdf/20260612-song-template.prs');
  const outputDir = path.resolve('pdf/output');

  if (!fs.existsSync(templatePath)) {
    console.error(`Template not found: ${templatePath}`);
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const filter = process.argv[2] ?? '';
  const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}\.json$/;
  const jsonFiles = fs
    .readdirSync(outputDir)
    .filter((f) => DATE_PATTERN.test(f) && (!filter || f.includes(filter)))
    .map((f) => path.join(outputDir, f));

  if (jsonFiles.length === 0) {
    console.error(filter ? `No JSON matching "${filter}" in pdf/output/` : 'No JSON files in pdf/output/');
    process.exit(1);
  }

  // Read the template .prs once
  const templateZip = new AdmZip(templatePath);
  const templatePrs = JSON.parse(templateZip.readAsText('BackupPresentation.json'));
  const templateItem = templatePrs.items[0]; // base template for all song items

  for (const jsonFile of jsonFiles) {
    const name = path.basename(jsonFile, '.json');
    console.log(`\nGenerating: ${name}.prs`);

    const data = JSON.parse(fs.readFileSync(jsonFile, 'utf-8')) as ParseResult;

    // Build one SongLyrics item per song
    const items = data.songs.map((song) => {
      const lyricsXml = buildLyricsXml(song.slideData);
      const customOrder = buildOrderSequence(song.arrangement, song.slideData);

      console.log(`  • ${song.title}`);
      console.log(`    Order: ${customOrder}`);

      const content = {
        ...templateItem.content,
        '_richtextfield:Lyrics': lyricsXml,
        SongDisplayTitle: song.title,
        '_textfield:Song Title': song.title,
        CustomOrderSequence: customOrder,
        CustomOrderSlides: 'true',
        IsTitleOverridden2: 'true',
      };
      // Remove FaithLife arrangement link — keeping it causes Proclaim to sync
      // all items with the same cloud lyrics, overwriting our custom content.
      delete content['ProclaimArrangement'];
      delete content['ArrangementSyncId'];
      // Keep EmphasisTextStyle from template unchanged — the original "Rotate1,64"
      // algorithm is what Proclaim uses to apply the yellow emphasisColor to
      // English paragraphs. Modifying it breaks the coloring.

      return {
        ...templateItem,
        id: randomUUID(),   // unique per song
        // modifiedDate intentionally kept from template — Proclaim rejects new items
        // with a current timestamp; only accepts the template's original date.
        title: song.title,  // Korean title from the PDF
        content,
      };
    });

    // Build updated BackupPresentation.json.
    // Keep the template's presentation ID — Proclaim restore requires the ID to
    // match a presentation already known to the account.
    const newPrs = {
      ...templatePrs,
      title: name,
      dateGiven: data.date?.split(',')[0] || new Date().toISOString().split('T')[0],
      preServiceStartIndex: 0,
      startIndex: 0,
      postServiceStartIndex: items.length, // all items are in-service
      items,
    };

    // Write BackupPresentation.json to a temp file, then use Python to clone
    // the template ZIP (preserves original ZIP flags — adm-zip sets UTF-8 flag
    // bits that Proclaim rejects)
    const outPath = path.join(outputDir, `${name}.prs`);
    const tmpJson = path.join(os.tmpdir(), `prs-bp-${randomUUID()}.json`);
    try {
      fs.writeFileSync(tmpJson, JSON.stringify(newPrs), 'utf-8');
      const pyHelper = path.resolve('scripts/prs-zip-writer.py');
      execFileSync('python3', [pyHelper, templatePath, tmpJson, outPath]);
    } finally {
      fs.rmSync(tmpJson, { force: true });
    }

    console.log(`  ✓ Saved: ${path.relative(process.cwd(), outPath)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
