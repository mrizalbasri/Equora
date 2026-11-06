"""Portable snapshot report; all text is escaped before ReportLab markup parsing."""

import io
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

INDICATOR_LABELS = {
    "sanitation_percent": "Sanitasi dasar",
    "water_percent": "Air bersih",
    "computers_percent": "Komputer pembelajaran",
    "internet_percent": "Akses internet",
}

STRATEGY_LABELS = {
    "Solver": "Optimasi Solver (CP-SAT)",
    "equal": "Pembagian merata bergiliran (Equal)",
    "greedy": "Prioritas rasio kebutuhan/biaya (Greedy)",
}


def _rupiah(amount) -> str:
    if amount is None:
        return "Tidak tersedia"
    val = int(amount)
    sign = "-" if val < 0 else ""
    formatted = f"{abs(val):,}".replace(",", ".")
    return f"{sign}Rp {formatted}"


def _region_label(names: dict, code: str) -> str:
    name = names.get(code)
    return f"{name} ({code})" if name and name != code else str(code)


def _weights_summary(weights: dict) -> str:
    parts = []
    for key, val in weights.items():
        label = INDICATOR_LABELS.get(key, key)
        try:
            pct = float(val) * 100
            parts.append(f"{label}: {pct:g}%")
        except TypeError, ValueError:
            parts.append(f"{label}: {val}")
    return ", ".join(parts)


def _styled_table(rows, col_widths):
    table = Table(rows, repeatRows=1, colWidths=col_widths)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#eaf3ff")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#cbd5e1")),
                ("FONTSIZE", (0, 0), (-1, -1), 8.5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]
        )
    )
    return table


def snapshot_pdf(snapshot, comparison=None):
    output = io.BytesIO()
    styles = getSampleStyleSheet()
    body = styles["BodyText"]
    body.fontSize = 9
    body.leading = 13
    cell_style = ParagraphStyle(
        "TableCell",
        parent=body,
        fontSize=8.5,
        leading=11.5,
    )
    story = []
    names = dict(snapshot.get("region_names") or {})
    if comparison and comparison.get("right", {}).get("region_names"):
        names = {**comparison["right"]["region_names"], **names}

    def paragraph(text, style=body):
        story.append(Paragraph(escape(str(text)), style))
        story.append(Spacer(1, 2.5 * mm))

    def cell(text):
        return Paragraph(escape(str(text)), cell_style)

    paragraph("EQUORA · MEMO RINGKASAN SIMULASI ALOKASI", styles["Title"])
    params = snapshot["parameters"]
    paragraph(params["name"], styles["Heading2"])

    alloc = snapshot["allocation"]
    eval_data = alloc.get("evaluation") or {}
    allocations = alloc.get("allocations") or {}
    total_packages = sum(v or 0 for v in allocations.values())
    receiving_count = sum(1 for v in allocations.values() if (v or 0) > 0)
    eligible_count = len(snapshot["priority"]["ranked"])

    meta_rows = [
        ["Atribut Snapshot", "Nilai", "Ringkasan Hasil", "Nilai"],
        [
            "ID Snapshot",
            cell(snapshot["id"]),
            "Status Solver",
            str(alloc["status"]),
        ],
        [
            "Rilis & Status Data",
            cell(f"{snapshot['release_id']} ({snapshot['data_status']})"),
            "Total Paket Teralokasi",
            f"{total_packages} paket ({receiving_count}/{eligible_count} provinsi)",
        ],
        [
            "Jenjang Pendidikan",
            str(params.get("education_level", "SD")),
            "Anggaran Terpakai",
            _rupiah(eval_data.get("budget_used_idr")),
        ],
        [
            "Metode & Solver",
            cell(
                f"{snapshot['priority']['method_version']} / "
                f"{alloc['model_version']} (OR-Tools {alloc.get('solver_version')})"
            ),
            "Sisa Anggaran",
            _rupiah(eval_data.get("budget_remaining_idr")),
        ],
    ]
    story.append(_styled_table(meta_rows, [34 * mm, 56 * mm, 38 * mm, 42 * mm]))
    story.append(Spacer(1, 4 * mm))

    paragraph("Parameter dan asumsi simulasi (demo)", styles["Heading2"])
    param_rows = [
        ["Parameter", "Asumsi yang Digunakan"],
        ["Plafon anggaran", _rupiah(params.get("budget_idr"))],
        ["Biaya per paket (default)", _rupiah(params.get("cost_idr"))],
        [
            "Kapasitas & minimum paket",
            f"Maks {params.get('capacity', 0)} paket / "
            f"Min {params.get('minimum_packages', 0)} paket per provinsi",
        ],
        ["Bobot indikator kebutuhan", cell(_weights_summary(params.get("weights") or {}))],
    ]
    overrides = params.get("overrides") or {}
    if overrides:
        override_parts = [
            f"{_region_label(names, code)}: biaya {_rupiah(cfg.get('cost_idr'))}, "
            f"kapasitas {cfg.get('capacity')}, min {cfg.get('minimum_packages', 0)}"
            for code, cfg in overrides.items()
        ]
        param_rows.append(["Override khusus wilayah", cell("; ".join(override_parts))])
    story.append(_styled_table(param_rows, [50 * mm, 120 * mm]))
    story.append(Spacer(1, 4 * mm))

    if comparison:
        right = comparison["right"]
        right_params = right["parameters"]
        paragraph("Perbandingan dua skenario", styles["Heading2"])
        paragraph(f"Pembanding: {right_params['name']} (ID: {right['id']} · {right['created_at']})")
        delta_idr = comparison["budget_delta_idr"]
        delta_prefix = "+" if delta_idr > 0 else ""
        paragraph(f"Selisih biaya terpakai (pembanding − awal): {delta_prefix}{_rupiah(delta_idr)}")
        paragraph(f"Bobot pembanding: {_weights_summary(right_params.get('weights') or {})}")
        for text in comparison["warnings"]:
            paragraph(f"Catatan: {text}")
        comparison_rows = [["Provinsi", "Paket awal", "Pembanding", "Selisih", "Rank awal -> baru"]]
        for row in comparison["rows"]:
            delta = row["delta"]
            delta_str = f"+{delta}" if delta > 0 else str(delta)
            comparison_rows.append(
                [
                    cell(_region_label(names, row["region_code"])),
                    str(row["left_packages"]),
                    str(row["right_packages"]),
                    delta_str,
                    f"{row['left_rank'] or '-'} -> {row['right_rank'] or '-'}",
                ]
            )
        story.append(_styled_table(comparison_rows, [62 * mm, 25 * mm, 28 * mm, 23 * mm, 32 * mm]))
        story.append(Spacer(1, 4 * mm))

    paragraph("Perbandingan hasil solver dan strategi baseline", styles["Heading2"])
    baseline_rows = [
        ["Strategi Alokasi", "Status", "Anggaran Terpakai", "Objective Proxy", "Catatan"]
    ]
    for name, result in {"Solver": alloc, **snapshot["baselines"]}.items():
        ev = result.get("evaluation")
        obj_str = f"{ev['objective_units'] / 10000:.4f}" if ev else "Tidak tersedia"
        budget_str = _rupiah(ev["budget_used_idr"]) if ev else "Tidak tersedia"
        note = result.get("reason") or (
            f"Gap: {result.get('absolute_gap_units', 0)}"
            if name == "Solver" and ev
            else "Tervalidasi"
        )
        baseline_rows.append(
            [
                cell(STRATEGY_LABELS.get(name, name)),
                str(result["status"]),
                budget_str,
                obj_str,
                cell(note),
            ]
        )
    story.append(_styled_table(baseline_rows, [56 * mm, 24 * mm, 34 * mm, 26 * mm, 30 * mm]))
    story.append(Spacer(1, 4 * mm))

    paragraph("Peringkat kebutuhan dan alokasi paket per provinsi", styles["Heading2"])
    rows = [["Provinsi", "Peringkat", "Skor Kebutuhan (MCDA)", "Paket Dialokasikan"]]
    for row in snapshot["priority"]["ranked"]:
        code = row["region_code"]
        pkg = allocations.get(code)
        rows.append(
            [
                cell(_region_label(names, code)),
                str(row["rank"]),
                f"{float(row['score']):.4f}",
                f"{pkg} paket" if pkg is not None else "-",
            ]
        )
    story.append(_styled_table(rows, [72 * mm, 24 * mm, 40 * mm, 34 * mm]))
    story.append(Spacer(1, 3 * mm))

    excluded = snapshot["priority"].get("excluded") or {}
    if excluded:
        excluded_parts = [
            f"{_region_label(names, code)} (indikator belum tersedia: "
            f"{', '.join(INDICATOR_LABELS.get(k, k) for k in keys)})"
            for code, keys in excluded.items()
        ]
        paragraph("Wilayah dikecualikan dari peringkat: " + "; ".join(excluded_parts))
    else:
        paragraph(
            "Wilayah dikecualikan dari peringkat: Tidak ada (seluruh wilayah memenuhi syarat data)."
        )

    paragraph("Batas interpretasi", styles["Heading2"])
    for text in snapshot["limitations"]:
        paragraph(f"• {text}")

    paragraph("Provenance sumber data", styles["Heading2"])
    for source in snapshot["sources"]:
        block = [Paragraph(escape(source["title"]), styles["Heading3"])]
        for key, label in (
            ("source_url", "URL Sumber"),
            ("sha256", "Checksum SHA-256"),
            ("unit", "Satuan"),
            ("retrieved_at", "Diunduh"),
            ("license_status", "Status Lisensi"),
        ):
            block.extend(
                [Paragraph(escape(f"{label}: {source.get(key)}"), body), Spacer(1, 1.5 * mm)]
            )
        story.append(KeepTogether(block))

    def footer(canvas, document):
        canvas.setFont("Helvetica", 8)
        canvas.drawString(
            20 * mm,
            12 * mm,
            "Equora · Review lokal · Asumsi biaya demo · Bukan keputusan anggaran resmi",
        )
        canvas.drawRightString(190 * mm, 12 * mm, f"Hal. {document.page}")

    SimpleDocTemplate(
        output,
        pagesize=(210 * mm, 297 * mm),
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=18 * mm,
        bottomMargin=22 * mm,
    ).build(story, onFirstPage=footer, onLaterPages=footer)
    return output.getvalue()
