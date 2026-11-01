import "server-only";

import { jsPDF } from "jspdf";
import sharp from "sharp";
import type { RoastReport } from "@/lib/report";

const INK = "#0b0b0b";
const PAPER = "#ffffff";
const SKY = "#dceeff";
const ORANGE = "#fb4903";
const VIOLET = "#5c4ade";
const MINT = "#55db9c";
const SUN = "#ffd731";
const LAVENDER = "#e9ccff";

function printable(value: string) {
  return value
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .trim();
}

export function createAuditPdf(report: RoastReport) {
  const pdf = new jsPDF({ unit: "pt", format: "a4", orientation: "portrait", compress: true });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 42;
  const contentWidth = pageWidth - margin * 2;
  let y = 0;

  const setFill = (hex: string) => pdf.setFillColor(hex);
  const setText = (hex: string) => pdf.setTextColor(hex);
  const lines = (value: string, width: number) =>
    value.split(/\n/).flatMap((paragraph) =>
      paragraph.trim() ? (pdf.splitTextToSize(printable(paragraph), width) as string[]) : [""],
    );

  function pageHeader(first = false) {
    setFill(first ? INK : SKY);
    pdf.rect(0, 0, pageWidth, first ? 104 : 48, "F");
    setText(first ? PAPER : INK);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(first ? 16 : 10);
    pdf.text("ROAST & RESCUE", margin, first ? 38 : 29);
    if (first) {
      setText(ORANGE);
      pdf.setFontSize(10);
      pdf.text("LANDING-PAGE CLARITY AUDIT", margin, 60);
      setText(PAPER);
      pdf.setFontSize(25);
      pdf.text("THE JUDGES HAVE SPOKEN.", margin, 88);
    }
    y = first ? 126 : 68;
  }

  function ensureSpace(height: number) {
    if (y + height <= pageHeight - 52) return;
    pdf.addPage();
    pageHeader(false);
  }

  function label(value: string, color = INK) {
    setText(color);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(printable(value).toUpperCase(), margin, y);
    y += 18;
  }

  function card(
    heading: string,
    body: string,
    fill: string,
    options: { accent?: string; bodySize?: number; after?: number } = {},
  ) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(options.bodySize ?? 12);
    const bodyLines = lines(body, contentWidth - 36);
    const height = 54 + bodyLines.length * ((options.bodySize ?? 12) + 4);
    ensureSpace(height + 14);
    setFill(fill);
    pdf.roundedRect(margin, y, contentWidth, height, 12, 12, "F");
    setText(options.accent ?? INK);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.text(printable(heading).toUpperCase(), margin + 18, y + 22);
    setText(fill === INK ? PAPER : INK);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(options.bodySize ?? 12);
    pdf.text(bodyLines, margin + 18, y + 44, { lineHeightFactor: 1.28 });
    y += height + (options.after ?? 14);
  }

  pageHeader(true);
  card("The five-second verdict", `"${report.roast}"`, ORANGE, { accent: PAPER, bodySize: 17, after: 22 });
  label("01 - The panel");
  report.judges.forEach((judge, index) => {
    const fill = ["#ffdfd0", LAVENDER, MINT][index];
    card(
      `${judge.name} - ${judge.lens}`,
      `"${judge.opinion}"\n\nVERDICT: ${judge.verdict}`,
      fill,
      { accent: VIOLET, bodySize: 11 },
    );
  });

  label("The unanimous verdict");
  report.consensus.forEach((point, index) => card(`Priority ${index + 1}`, point, INK, { accent: SUN, bodySize: 11 }));
  label("Show, don't tell");
  card("Before", report.example.before, "#eeeeee", { bodySize: 12 });
  card("After", report.example.after, MINT, { bodySize: 13 });
  card("Why it works", report.example.why, SUN, { bodySize: 11, after: 22 });

  label("02 - Diagnosis");
  const readLabels: Array<[string, string]> = [
    ["Product", report.visitorRead.product],
    ["Audience", report.visitorRead.audience],
    ["Benefit", report.visitorRead.benefit],
    ["Action", report.visitorRead.action],
    ["Confusion", report.visitorRead.confusion],
  ];
  readLabels.forEach(([heading, value]) => card(`Visitor reads: ${heading}`, value, PAPER, { bodySize: 11 }));
  card("The intention gap", report.intentGap, SUN, { bodySize: 13, after: 20 });

  ensureSpace(160);
  label("Subjective clarity signals");
  Object.entries(report.scores).forEach(([name, score]) => {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    setText(INK);
    pdf.text(name.toUpperCase(), margin, y + 10);
    setFill("#e9e9e9");
    pdf.roundedRect(margin + 120, y, contentWidth - 150, 12, 6, 6, "F");
    setFill(VIOLET);
    pdf.roundedRect(margin + 120, y, ((contentWidth - 150) * score) / 5, 12, 6, 6, "F");
    pdf.text(`${score}/5`, pageWidth - margin - 24, y + 10);
    y += 28;
  });
  y += 12;

  label("03 - Rescue");
  card("Keep this", report.keep, MINT, { bodySize: 12, after: 20 });
  report.improvements.forEach((item, index) => card(`0${index + 1} - ${item.title}`, item.detail, index === 1 ? LAVENDER : index === 2 ? MINT : PAPER, { bodySize: 11 }));
  const rescued = [
    report.rewrite.eyebrow.toUpperCase(),
    "",
    report.rewrite.headline,
    "",
    report.rewrite.subheading,
    "",
    `CTA: ${report.rewrite.cta}`,
  ].join("\n");
  card("Your rescued hero", rescued, VIOLET, { accent: SUN, bodySize: 14, after: 20 });

  const pages = pdf.getNumberOfPages();
  for (let page = 1; page <= pages; page += 1) {
    pdf.setPage(page);
    pdf.setDrawColor("#bbbbbb");
    pdf.line(margin, pageHeight - 32, pageWidth - margin, pageHeight - 32);
    setText("#555555");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text("Subjective clarity signals - review and test before shipping.", margin, pageHeight - 18);
    pdf.text(`${page} / ${pages}`, pageWidth - margin, pageHeight - 18, { align: "right" });
  }

  return new Uint8Array(pdf.output("arraybuffer"));
}

function escapeXml(value: string) {
  return printable(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function wrap(value: string, maxCharacters: number) {
  const output: string[] = [];
  value.split(/\n/).forEach((paragraph, paragraphIndex, paragraphs) => {
    const words = printable(paragraph).split(/\s+/).filter(Boolean);
    let line = "";
    words.forEach((word) => {
      const candidate = line ? `${line} ${word}` : word;
      if (candidate.length <= maxCharacters || !line) line = candidate;
      else { output.push(line); line = word; }
    });
    if (line) output.push(line);
    if (paragraphIndex < paragraphs.length - 1) output.push("");
  });
  return output;
}

function svgLines(textLines: string[], x: number, y: number, size: number, lineHeight: number, weight = 700, color = INK) {
  const spans = textLines.map((line, index) => `<tspan x="${x}" y="${y + index * lineHeight}">${escapeXml(line)}</tspan>`).join("");
  return `<text font-family="Arial, sans-serif" font-size="${size}" font-weight="${weight}" fill="${color}">${spans}</text>`;
}

export async function createAuditPng(report: RoastReport) {
  const width = 1600;
  const margin = 80;
  const content = width - margin * 2;
  const parts: string[] = [];
  let y = 70;

  const rect = (x: number, top: number, w: number, h: number, fill: string, radius = 28) =>
    parts.push(`<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${INK}" stroke-width="4"/>`);
  const sectionLabel = (value: string) => {
    parts.push(svgLines([value.toUpperCase()], margin, y, 22, 28, 900));
    y += 44;
  };
  const fullCard = (heading: string, body: string, fill: string, size = 30) => {
    const maximumCharacters = Math.max(34, Math.floor((content - 72) / (size * .67)));
    const bodyLines = wrap(body, maximumCharacters);
    const height = 100 + bodyLines.length * (size + 12);
    rect(margin, y, content, height, fill);
    parts.push(svgLines([heading.toUpperCase()], margin + 36, y + 42, 20, 26, 900, fill === INK ? SUN : VIOLET));
    parts.push(svgLines(bodyLines, margin + 36, y + 92, size, size + 12, size >= 38 ? 900 : 700, fill === INK ? PAPER : INK));
    y += height + 30;
  };

  rect(margin, y, content, 210, INK, 34);
  parts.push(svgLines(["ROAST & RESCUE"], margin + 40, y + 55, 30, 38, 900, PAPER));
  parts.push(svgLines(["LANDING-PAGE CLARITY AUDIT"], margin + 40, y + 100, 20, 28, 900, ORANGE));
  parts.push(svgLines(["THE JUDGES HAVE SPOKEN."], margin + 40, y + 165, 52, 58, 900, PAPER));
  y += 250;
  fullCard("The five-second verdict", `"${report.roast}"`, ORANGE, 42);

  sectionLabel("01 - The panel");
  const gap = 20;
  const cardWidth = (content - gap * 2) / 3;
  const judgeLines = report.judges.map((judge) => ({
    name: wrap(judge.name, 22),
    opinion: wrap(`"${judge.opinion}"`, 34),
    verdict: wrap(judge.verdict.toUpperCase(), 30),
  }));
  const judgeHeight = Math.max(...judgeLines.map((item) => 180 + item.name.length * 40 + item.opinion.length * 34 + item.verdict.length * 34));
  report.judges.forEach((judge, index) => {
    const x = margin + index * (cardWidth + gap);
    rect(x, y, cardWidth, judgeHeight, ["#ffdfd0", LAVENDER, MINT][index]);
    parts.push(svgLines([judge.lens.toUpperCase()], x + 28, y + 42, 18, 24, 900, VIOLET));
    parts.push(svgLines(judgeLines[index].name, x + 28, y + 94, 34, 40, 900));
    const opinionY = y + 116 + judgeLines[index].name.length * 40;
    parts.push(svgLines(judgeLines[index].opinion, x + 28, opinionY, 24, 34, 650));
    parts.push(svgLines(judgeLines[index].verdict, x + 28, y + judgeHeight - 34 * judgeLines[index].verdict.length - 20, 24, 34, 900));
  });
  y += judgeHeight + 34;

  sectionLabel("The unanimous verdict");
  report.consensus.forEach((point, index) => fullCard(`Priority ${index + 1}`, point, INK, 27));
  sectionLabel("02 - Diagnosis");
  fullCard("The intention gap", report.intentGap, SUN, 32);
  Object.entries(report.visitorRead).forEach(([name, value]) => fullCard(`Visitor reads: ${name.replace(/([A-Z])/g, " $1")}`, value, PAPER, 25));

  sectionLabel("03 - Rescue");
  fullCard("Keep this", report.keep, MINT, 28);
  report.improvements.forEach((item, index) => fullCard(`0${index + 1} - ${item.title}`, item.detail, index === 1 ? LAVENDER : index === 2 ? MINT : PAPER, 27));
  fullCard("Before", report.example.before, "#eeeeee", 28);
  fullCard("After", report.example.after, MINT, 34);
  fullCard("Your rescued hero", `${report.rewrite.eyebrow}\n${report.rewrite.headline}\n${report.rewrite.subheading}\nCTA: ${report.rewrite.cta}`, VIOLET, 34);
  y += 20;

  const height = y + 70;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="${SKY}"/>${parts.join("")}</svg>`;
  return sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
}
