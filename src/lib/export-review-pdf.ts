import { jsPDF } from "jspdf";

export type PdfRow = {
  label: string;
  value: string | number | boolean | null | undefined;
};

export type PdfSection = {
  title: string;
  rows: PdfRow[];
};

type ExportOptions = {
  title: string;
  subtitle?: string;
  fileName: string;
  sections: PdfSection[];
  metadata?: PdfRow[];
  logoUrl?: string;
};

const palette = {
  green: [62, 151, 112] as const,
  yellow: [236, 171, 55] as const,
  violet: [146, 54, 148] as const,
  ink: [28, 47, 53] as const,
  muted: [101, 111, 118] as const,
  line: [218, 216, 220] as const,
  paper: [248, 247, 248] as const,
  white: [255, 255, 255] as const,
};

function displayValue(value: PdfRow["value"]) {
  if (value === null || value === undefined || value === "") return "Sin respuesta";
  if (typeof value === "boolean") return value ? "Sí" : "No";
  return String(value);
}

async function imageDataUrl(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

function cleanFileName(fileName: string) {
  const base = fileName
    .replace(/\.pdf$/i, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `${base || "registro-crece"}.pdf`;
}

export async function exportCrecePdf({
  title,
  subtitle = "Vista previa de la información registrada",
  fileName,
  sections,
  metadata = [],
  logoUrl = "/assets/logo-crece.png",
}: ExportOptions) {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const logo = await imageDataUrl(logoUrl);
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 17;
  const contentWidth = pageWidth - margin * 2;
  const footerY = pageHeight - 9;
  const contentBottom = footerY - 7;
  const generatedAt = new Intl.DateTimeFormat("es-PE", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date());

  let y = 0;
  let firstPage = true;

  const drawColorBand = () => {
    const segment = pageWidth / 3;
    doc.setFillColor(...palette.green);
    doc.rect(0, 0, segment, 2.2, "F");
    doc.setFillColor(...palette.yellow);
    doc.rect(segment, 0, segment, 2.2, "F");
    doc.setFillColor(...palette.violet);
    doc.rect(segment * 2, 0, segment, 2.2, "F");
  };

  const drawLogo = () => {
    if (logo) {
      doc.addImage(logo, "PNG", pageWidth - margin - 24, 9, 24, 24, undefined, "FAST");
      return;
    }
    doc.setDrawColor(...palette.line);
    doc.setTextColor(...palette.violet);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.roundedRect(pageWidth - margin - 24, 10, 24, 16, 2, 2, "S");
    doc.text("CRECE", pageWidth - margin - 12, 20, { align: "center" });
  };

  const drawPageHeader = (isFirst: boolean) => {
    drawColorBand();
    drawLogo();
    if (isFirst) {
      doc.setTextColor(...palette.green);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text("PROYECTO CRECE · MONITOREO Y EVALUACIÓN", margin, 13);

      doc.setTextColor(...palette.violet);
      doc.setFontSize(18);
      const titleLines = doc.splitTextToSize(title, contentWidth - 34) as string[];
      doc.text(titleLines, margin, 23);

      const titleBottom = 23 + Math.max(0, titleLines.length - 1) * 7;
      doc.setTextColor(...palette.muted);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      const subtitleLines = doc.splitTextToSize(subtitle, contentWidth - 34) as string[];
      doc.text(subtitleLines, margin, titleBottom + 7);

      const subtitleBottom = titleBottom + 7 + Math.max(0, subtitleLines.length - 1) * 4.2;
      doc.setFontSize(7.5);
      doc.text(`Generado el ${generatedAt}`, margin, subtitleBottom + 6);
      doc.setDrawColor(...palette.line);
      doc.line(margin, subtitleBottom + 10, pageWidth - margin, subtitleBottom + 10);
      y = subtitleBottom + 16;
    } else {
      doc.setTextColor(...palette.green);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7);
      doc.text("PROYECTO CRECE · MONITOREO Y EVALUACIÓN", margin, 12);
      doc.setTextColor(...palette.violet);
      doc.setFontSize(12);
      doc.text(doc.splitTextToSize(title, contentWidth - 34), margin, 20);
      doc.setDrawColor(...palette.line);
      doc.line(margin, 27, pageWidth - margin, 27);
      y = 33;
    }
  };

  const addPage = () => {
    if (!firstPage) doc.addPage();
    drawPageHeader(firstPage);
    firstPage = false;
  };

  const ensureSpace = (needed: number) => {
    if (y + needed <= contentBottom) return;
    doc.addPage();
    drawPageHeader(false);
  };

  const renderSectionHeading = (sectionTitle: string) => {
    const lines = doc.splitTextToSize(sectionTitle, contentWidth - 8) as string[];
    const height = Math.max(10, 5 + lines.length * 4);
    ensureSpace(height + 7);
    doc.setFillColor(...palette.paper);
    doc.roundedRect(margin, y, contentWidth, height, 1.5, 1.5, "F");
    doc.setFillColor(...palette.green);
    doc.rect(margin, y, 2.2, height, "F");
    doc.setTextColor(...palette.ink);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(lines, margin + 6, y + 6);
    y += height + 3;
  };

  let rowIndex = 0;
  const renderRow = ({ label, value }: PdfRow) => {
    const labelText = label.trim() || "Dato";
    const valueText = displayValue(value).replace(/\r\n/g, "\n").trim();
    const labelLines = doc.splitTextToSize(labelText, contentWidth - 7) as string[];
    const valueLines = doc.splitTextToSize(valueText, contentWidth - 7) as string[];
    let offset = 0;
    let continued = false;

    while (offset < valueLines.length || (!continued && valueLines.length === 0)) {
      const labelHeight = (labelLines.length + (continued ? 1 : 0)) * 3.3;
      const availableHeight = contentBottom - y;
      const maxValueLines = Math.max(1, Math.floor((availableHeight - labelHeight - 7) / 4.1));

      if (maxValueLines < 1 || availableHeight < 16) {
        doc.addPage();
        drawPageHeader(false);
        continue;
      }

      const chunk = valueLines.slice(offset, offset + maxValueLines);
      const rowHeight = Math.max(14, labelHeight + chunk.length * 4.1 + 6);
      if (rowHeight > availableHeight && y > 38) {
        doc.addPage();
        drawPageHeader(false);
        continue;
      }

      if (rowIndex % 2 === 0) {
        doc.setFillColor(...palette.paper);
        doc.roundedRect(margin, y, contentWidth, rowHeight, 1, 1, "F");
      }
      doc.setTextColor(...palette.green);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.2);
      const renderedLabel = continued ? [`${labelText} (continuación)`] : labelLines;
      doc.text(renderedLabel, margin + 3.5, y + 4.8);

      doc.setTextColor(...palette.ink);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.3);
      const valueY = y + 5.5 + renderedLabel.length * 3.3;
      doc.text(chunk.length > 0 ? chunk : ["Sin respuesta"], margin + 3.5, valueY);

      doc.setDrawColor(...palette.line);
      doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);
      y += rowHeight + 1.2;
      offset += chunk.length;
      continued = offset < valueLines.length;
      rowIndex += 1;
      if (continued) {
        doc.addPage();
        drawPageHeader(false);
      }
    }
  };

  addPage();

  if (metadata.length > 0) {
    renderSectionHeading("Datos del registro");
    metadata.forEach(renderRow);
    y += 4;
  }

  sections
    .filter((section) => section.rows.length > 0)
    .forEach((section) => {
      renderSectionHeading(section.title);
      section.rows.forEach(renderRow);
      y += 4;
    });

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setDrawColor(...palette.line);
    doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);
    doc.setTextColor(...palette.muted);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.text("Proyecto CRECE · Monitoreo y Evaluación", margin, footerY);
    doc.text(`Página ${page} de ${pageCount}`, pageWidth - margin, footerY, { align: "right" });
  }

  doc.save(cleanFileName(fileName));
}

