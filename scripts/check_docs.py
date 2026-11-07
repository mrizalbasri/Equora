"""Check local file targets in the repository's Markdown links."""

import re
import subprocess
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]

try:
    tracked_files = subprocess.check_output(
        ["git", "ls-files", "*.md", "*/*.md", "*/*/*.md"],
        cwd=ROOT,
        text=True,
        encoding="utf-8",
    ).splitlines()
    files = [ROOT / f for f in tracked_files if (ROOT / f).exists()]
except Exception:
    excluded = {".git", "node_modules", ".venv", "venv", "docs"}
    files = [f for f in ROOT.rglob("*.md") if not any(part in excluded for part in f.parts)]

errors = []
for source in files:
    body = source.read_text(encoding="utf-8")
    body = re.sub(r"```.*?```", "", body, flags=re.DOTALL)
    for match in re.finditer(r"\[[^\]]*\]\(([^)]+)\)", body):
        target = match.group(1).strip().strip("<>")
        url = urlsplit(target)
        if url.scheme or url.netloc or not url.path:
            continue
        path = unquote(url.path)
        destination = ROOT / path.lstrip("/") if path.startswith("/") else source.parent / path
        if not destination.exists():
            errors.append(f"{source.relative_to(ROOT)}: missing {target}")
if errors:
    raise SystemExit("\n".join(errors))
print(f"Checked local file links in {len(files)} Markdown files.")
