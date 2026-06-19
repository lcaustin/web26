#!/usr/bin/env python3
"""Normalize worship flow lyric drafts.

This helper is intentionally conservative. It rewrites common section labels,
normalizes Flow lines to comma separators, and reports sung sections with more
than the allowed lyric lines.
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path


LABELS = {
    "A": "Verse 1",
    "B": "Verse 2",
    "C": "Chorus",
    "D": "Tag",
    "V": "Verse",
    "V1": "Verse 1",
    "V2": "Verse 2",
    "V3": "Verse 3",
    "V4": "Verse 4",
    "C1": "Chorus 1",
    "C2": "Chorus 2",
}

SECTION_RE = re.compile(r"^(A|B|C|D|V|V[1-4]|C[1-2])(\s*(?:[-(].*)?)$")
FLOW_RE = re.compile(r"^(Flow(?: placement)?:\s*)(.*)$")
SUNG_RE = re.compile(r"^(Verse(?: \d+)?|Chorus(?: \d+)?|Tag)(?:\b| x\d+| -|$)")


def normalize_flow(text: str) -> str:
    for source, target in sorted(LABELS.items(), key=lambda item: -len(item[0])):
        text = re.sub(rf"\b{re.escape(source)}\b", target, text)
    return text.replace("-", ", ")


def normalize_line(line: str) -> str:
    flow_match = FLOW_RE.match(line)
    if flow_match:
        return flow_match.group(1) + normalize_flow(flow_match.group(2))

    match = SECTION_RE.match(line.strip())
    if not match:
        return line

    label, suffix = match.groups()
    suffix = suffix or ""
    if suffix.startswith("("):
        suffix = " " + suffix
    return LABELS[label] + suffix


def validate_max_lines(lines: list[str], max_lines: int) -> list[str]:
    errors: list[str] = []
    current_label = ""
    count = 0

    def flush() -> None:
        nonlocal current_label, count
        if current_label and count > max_lines:
            errors.append(f"{current_label}: {count} lyric lines")
        current_label = ""
        count = 0

    for raw in lines:
        line = raw.rstrip("\n")
        if not line.strip():
            flush()
            continue
        if SUNG_RE.match(line):
            flush()
            current_label = line
            continue
        if current_label:
            count += 1
    flush()
    return errors


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--max-lines", type=int, default=2)
    args = parser.parse_args()

    lines = args.input.read_text(encoding="utf-8").splitlines()
    normalized = [normalize_line(line) for line in lines]
    args.output.write_text("\n".join(normalized) + "\n", encoding="utf-8")

    errors = validate_max_lines(normalized, args.max_lines)
    if errors:
        print("Sections over limit:")
        for error in errors:
            print(f"- {error}")
        return 1

    print(f"Wrote {args.output}")
    print(f"All sung sections are within {args.max_lines} lyric lines.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
