import { PDFDocument, StandardFonts, rgb, type PDFFont } from "pdf-lib";
import type { ArchiveDetail, ArchiveRow } from "./brief-types";

export async function buildBriefPdf(detail: ArchiveDetail, selectedBrief: ArchiveRow) {
  const pdf = await PDFDocument.create();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 46;
  const contentWidth = pageWidth - margin * 2;
  let page = pdf.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const addPage = () => {
    page = pdf.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  };
  const addLines = (text: string, font: PDFFont, size: number, color = rgb(0.16, 0.19, 0.22), indent = 0) => {
    const lines = wrapPdfText(text, font, size, contentWidth - indent);
    const lineHeight = size + 5;
    for (const line of lines) {
      if (y < margin + lineHeight) addPage();
      page.drawText(line, { x: margin + indent, y, size, font, color });
      y -= lineHeight;
    }
    y -= 5;
  };
  const addHeading = (text: string) => {
    if (y < margin + 45) addPage();
    y -= 8;
    page.drawText(sanitizePdfText(text), { x: margin, y, size: 15, font: bold, color: rgb(0.08, 0.29, 0.16) });
    y -= 22;
  };
  const addSubheading = (text: string) => {
    if (y < margin + 35) addPage();
    page.drawText(sanitizePdfText(text), { x: margin, y, size: 10.5, font: bold, color: rgb(0.12, 0.15, 0.18) });
    y -= 16;
  };
  const addBullet = (text: string) => addLines(`- ${text}`, regular, 9.5, rgb(0.22, 0.25, 0.28), 8);

  page.drawText(sanitizePdfText(`${selectedBrief.company} / ${selectedBrief.target}`), { x: margin, y, size: 22, font: bold, color: rgb(0.05, 0.10, 0.12) });
  y -= 28;
  addLines("Adopt X Investment Banking Brief", bold, 11, rgb(0.22, 0.47, 0.20));
  addLines(`${selectedBrief.dealType} - ${selectedBrief.sector} - ${selectedBrief.geography} - ${selectedBrief.approvedDate}`, regular, 9.5, rgb(0.35, 0.39, 0.42));
  addHeading("Executive Summary");
  addLines(detail.brief.executiveSummary, regular, 10.5);
  addHeading("Transaction Overview");
  addLines(detail.brief.transactionOverview, regular, 10.5);
  addSubheading("Transaction facts");
  for (const item of detail.transaction) addLines(`${item.label}: ${item.value}`, regular, 9.5, rgb(0.22, 0.25, 0.28));

  const analysis = detail.brief.analysis;
  if (analysis) {
    addHeading("Capability Purchased");
    analysis.capabilityPurchased.forEach(addBullet);
    addHeading("Build Versus Buy");
    addLines(analysis.buildVsBuy, regular, 10.5);
    addHeading("What Changed");
    addLines(analysis.marketChange, regular, 10.5);
    addHeading("Strategic Rationale");
    addLines(detail.brief.strategicRationale, regular, 10.5);
    analysis.strategicRationalePoints.forEach((item) => { addSubheading(item.title); addLines(item.detail, regular, 9.5); });
    addHeading("Value Drivers");
    analysis.valueDrivers.forEach(addBullet);
    addHeading("Synergy Map");
    analysis.synergyMap.forEach((item) => { addSubheading(item.category); item.items.forEach(addBullet); });
    addHeading("Risk Analysis");
    analysis.riskAnalysis.forEach((item) => { addSubheading(`${item.category}: ${item.title}`); addLines(item.detail, regular, 9.5); addLines(`Mitigation: ${item.mitigation}`, regular, 9.5, rgb(0.22, 0.40, 0.24)); });
    addHeading("Market Signal");
    addLines(analysis.marketSignal, regular, 10.5);
    addHeading("Follow the Money");
    analysis.followTheMoney.forEach((item) => { addSubheading(item.title); addLines(item.detail, regular, 9.5); });
    addHeading("Second-Order Effects");
    analysis.secondOrderEffects.forEach((item) => { addSubheading(item.question); addLines(item.answer, regular, 9.5); });
    addHeading("Market Implications");
    addLines(detail.brief.marketImplications, regular, 10.5);
    addHeading("Startup Opportunities");
    analysis.startupOpportunities.forEach((item) => { addSubheading(`${item.title} - ${item.confidence} confidence`); addLines(item.detail, regular, 9.5); });
    addHeading("Product Ideas");
    analysis.productIdeas.forEach((item) => { addSubheading(`${item.title} - ${item.confidence} confidence`); addLines(item.detail, regular, 9.5); });
    addHeading("Investment Thesis");
    addLines(analysis.investmentThesis, regular, 10.5);
  }

  addHeading("Key Takeaways");
  detail.brief.keyTakeaways.forEach(addBullet);
  addHeading("Evidence and Sources");
  detail.brief.evidenceUsed.forEach(addBullet);
  detail.sources.forEach((source) => addBullet(`${source.publisher}: ${source.headline} (${source.url})`));
  addHeading("Assessment");
  addLines(`Confidence score: ${detail.brief.confidenceScore ?? "Not available"}`, regular, 9.5);
  addLines(detail.brief.last30daysUsed ? "Last 30 Days context was used as secondary enrichment, not as proof of the transaction." : "Last 30 Days context was not used for this brief.", regular, 9.5);
  addLines("Prepared for discussion purposes only. Based on publicly available information. This document does not constitute investment advice or a fairness opinion.", regular, 8.5, rgb(0.38, 0.41, 0.43));
  return pdf.save();
}

function wrapPdfText(value: string, font: PDFFont, size: number, maxWidth: number) {
  return sanitizePdfText(value).split(/\r?\n/).flatMap((paragraph) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) return [""];
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) > maxWidth && line) { lines.push(line); line = word; } else line = candidate;
    }
    if (line) lines.push(line);
    return lines;
  });
}

function sanitizePdfText(value: string) {
  return value.replace(/[\u2010-\u2015]/g, "-").replace(/[^\x00-\x7F]/g, "?");
}

export function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "adopt-x";
}
