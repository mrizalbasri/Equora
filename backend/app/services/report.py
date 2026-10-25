"""Portable snapshot report; all text is escaped before ReportLab markup parsing."""

import io
import json
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


def snapshot_pdf(snapshot, comparison=None):
    output = io.BytesIO()
    styles = getSampleStyleSheet()
    body = styles["BodyText"]
    body.fontSize = 9
    body.leading = 13
    story = []

    def paragraph(text, style=body):
        story.append(Paragraph(escape(str(text)), style))
        story.append(Spacer(1, 3 * mm))

    paragraph("EQUORA / Laporan simulasi lokal", styles["Title"])
    paragraph(snapshot["parameters"]["name"], styles["Heading2"])
    for label, value in (
        ("Snapshot", snapshot["id"]),
        ("Dibuat", snapshot["created_at"]),
        ("Release", snapshot["release_id"]),
        ("Status data", snapshot["data_status"]),
        ("Metode", snapshot["priority"]["method_version"]),
        ("Model", snapshot["allocation"]["model_version"]),
        ("Solver", snapshot["allocation"]["solver_version"]),
    ):
        paragraph(f"{label}: {value}")
    paragraph("Parameter dan asumsi demo", styles["Heading2"])
    for key, value in snapshot["parameters"].items():
        paragraph(f"{key}: {json.dumps(value, ensure_ascii=True)}")
    if comparison:
        right = comparison["right"]
        paragraph("Perbandingan snapshot", styles["Heading2"])
        paragraph(f"Pembanding: {right['id']} / {right['parameters']['name']}")
        paragraph(f"Timestamp pembanding: {right['created_at']}")
        paragraph(f"Selisih biaya terpakai: Rp {comparison['budget_delta_idr']}")
        for text in comparison["warnings"]:
            paragraph(text)
        for key, value in right["parameters"].items():
            paragraph(f"Parameter pembanding {key}: {json.dumps(value, ensure_ascii=True)}")
        paragraph(f"Hasil pembanding: {json.dumps(right['allocation'])}")
        comparison_rows = [["Kode", "Paket awal", "Pembanding", "Selisih", "Rank awal/baru"]]
        for row in comparison["rows"]:
            comparison_rows.append(
                [
                    row["region_code"],
                    str(row["left_packages"]),
                    str(row["right_packages"]),
                    str(row["delta"]),
                    f"{row['left_rank']} / {row['right_rank']}",
                ]
            )
        story.append(
            Table(
                comparison_rows,
                repeatRows=1,
                colWidths=[33 * mm] * 5,
                style=[
                    ("GRID", (0, 0), (-1, -1), 0.3, colors.grey),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                ],
            )
        )
    paragraph("Hasil dan baseline", styles["Heading2"])
    for name, result in {"Solver": snapshot["allocation"], **snapshot["baselines"]}.items():
        paragraph(
            f"{name}: {result['status']}; evaluasi={result['evaluation']}; "
            f"alasan={result['reason']}; gap={result.get('absolute_gap_units')}"
        )
    rows = [["Kode wilayah", "Peringkat", "Skor kebutuhan", "Paket"]]
    for row in snapshot["priority"]["ranked"]:
        rows.append(
            [
                row["region_code"],
                str(row["rank"]),
                f"{float(row['score']):.6f}",
                str((snapshot["allocation"].get("allocations") or {}).get(row["region_code"], "-")),
            ]
        )
    table = Table(rows, repeatRows=1, colWidths=[42 * mm] * 4)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#eaf3ff")),
                ("GRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#dce4ee")),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(table)
    paragraph("Wilayah dikeluarkan: " + json.dumps(snapshot["priority"]["excluded"]))
    paragraph("Batas interpretasi", styles["Heading2"])
    for text in snapshot["limitations"]:
        paragraph(text)
    paragraph("Provenance sumber", styles["Heading2"])
    for source in snapshot["sources"]:
        block = [Paragraph(escape(source["title"]), styles["Heading3"])]
        for key in ("source_url", "sha256", "unit", "retrieved_at", "license_status"):
            block.extend([Paragraph(escape(f"{key}: {source.get(key)}"), body), Spacer(1, 3 * mm)])
        story.append(KeepTogether(block))

    def footer(canvas, document):
        canvas.setFont("Helvetica", 8)
        canvas.drawString(20 * mm, 12 * mm, "Review lokal - biaya demo - bukan keputusan resmi")
        canvas.drawRightString(190 * mm, 12 * mm, str(document.page))

    SimpleDocTemplate(
        output,
        pagesize=(210 * mm, 297 * mm),
        leftMargin=20 * mm,
        rightMargin=20 * mm,
        topMargin=18 * mm,
        bottomMargin=22 * mm,
    ).build(story, onFirstPage=footer, onLaterPages=footer)
    return output.getvalue()
