"""Check local file targets in the repository's Markdown links."""

from pathlib import Path
import re
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
files = sorted(ROOT.glob("*.md")) + sorted((ROOT / "docs").rglob("*.md"))
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
