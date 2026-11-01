import type { RoastReport } from "@/lib/report";

const WIDTH = 1600;
const MARGIN = 80;
const INK = "#0b0b0b";
const PAPER = "#f8f5ed";
const SKY = "#dceeff";
const ORANGE = "#fb4903";
const VIOLET = "#6d42ff";
const MINT = "#55db9c";
const SUN = "#ffd731";
const LAVENDER = "#e8ccff";

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: string,
  stroke = INK,
) {
  context.beginPath();
  context.roundRect(x, y, width, height, radius);
  context.fillStyle = fill;
  context.fill();
  context.strokeStyle = stroke;
  context.lineWidth = 4;
  context.stroke();
}

function wrapLines(context: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const paragraphs = text.split(/\n+/);
  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (context.measureText(candidate).width <= maxWidth || !line) line = candidate;
      else {
        lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function drawLines(
  context: CanvasRenderingContext2D,
  lines: string[],
  x: number,
  y: number,
  lineHeight: number,
) {
  lines.forEach((line, index) => context.fillText(line, x, y + index * lineHeight));
}

function drawLabel(context: CanvasRenderingContext2D, text: string, x: number, y: number, color = INK) {
  context.fillStyle = color;
  context.font = "900 20px Arial, sans-serif";
  context.fillText(text.toUpperCase(), x, y);
}

export function createAuditCanvas(report: RoastReport) {
  const draft = document.createElement("canvas");
  draft.width = WIDTH;
  draft.height = 6000;
  const context = draft.getContext("2d");
  if (!context) throw new Error("This browser could not prepare the audit export.");

  context.fillStyle = SKY;
  context.fillRect(0, 0, draft.width, draft.height);
  let y = 76;

  roundedRect(context, MARGIN, y, WIDTH - MARGIN * 2, 230, 34, INK);
  context.fillStyle = PAPER;
  context.font = "900 30px Arial, sans-serif";
  context.fillText("ROAST & RESCUE", MARGIN + 42, y + 56);
  context.fillStyle = ORANGE;
  context.font = "900 20px Arial, sans-serif";
  context.fillText("LANDING-PAGE CLARITY AUDIT", MARGIN + 42, y + 100);
  context.fillStyle = PAPER;
  context.font = "900 54px Arial, sans-serif";
  context.fillText("THE JUDGES HAVE SPOKEN.", MARGIN + 42, y + 172);
  context.fillStyle = SUN;
  context.beginPath();
  context.arc(WIDTH - MARGIN - 100, y + 112, 58, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = INK;
  context.font = "900 26px Arial, sans-serif";
  context.textAlign = "center";
  context.fillText("R&R", WIDTH - MARGIN - 100, y + 122);
  context.textAlign = "left";
  y += 270;

  context.font = "900 46px Arial, sans-serif";
  const roastLines = wrapLines(context, `“${report.roast}”`, WIDTH - MARGIN * 2 - 84);
  const roastHeight = 116 + roastLines.length * 58;
  roundedRect(context, MARGIN, y, WIDTH - MARGIN * 2, roastHeight, 30, ORANGE);
  drawLabel(context, "The five-second verdict", MARGIN + 42, y + 48, PAPER);
  context.fillStyle = PAPER;
  context.font = "900 46px Arial, sans-serif";
  drawLines(context, roastLines, MARGIN + 42, y + 112, 58);
  y += roastHeight + 42;

  drawLabel(context, "The panel", MARGIN, y + 22);
  y += 52;
  const cardGap = 22;
  const cardWidth = (WIDTH - MARGIN * 2 - cardGap * 2) / 3;
  const judgeBackgrounds = ["#ffdfd0", LAVENDER, MINT];
  context.font = "900 38px Arial, sans-serif";
  const judgeNameLines = report.judges.map((judge) => wrapLines(context, judge.name, cardWidth - 64));
  context.font = "700 25px Arial, sans-serif";
  const judgeOpinionLines = report.judges.map((judge) => wrapLines(context, `“${judge.opinion}”`, cardWidth - 64));
  context.font = "900 26px Arial, sans-serif";
  const judgeVerdictLines = report.judges.map((judge) => wrapLines(context, judge.verdict.toUpperCase(), cardWidth - 64));
  const judgeHeight = Math.max(
    430,
    ...judgeOpinionLines.map(
      (lines, index) =>
        176 + judgeNameLines[index].length * 42 + lines.length * 34 + judgeVerdictLines[index].length * 35,
    ),
  );
  report.judges.forEach((judge, index) => {
    const x = MARGIN + index * (cardWidth + cardGap);
    roundedRect(context, x, y, cardWidth, judgeHeight, 28, judgeBackgrounds[index]);
    drawLabel(context, judge.lens, x + 32, y + 45, VIOLET);
    context.fillStyle = INK;
    context.font = "900 38px Arial, sans-serif";
    drawLines(context, judgeNameLines[index], x + 32, y + 96, 42);
    const opinionY = y + 112 + judgeNameLines[index].length * 42;
    context.font = "700 25px Arial, sans-serif";
    drawLines(context, judgeOpinionLines[index], x + 32, opinionY, 34);
    const dividerY = y + judgeHeight - 34 - judgeVerdictLines[index].length * 35;
    context.strokeStyle = INK;
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(x + 32, dividerY - 24);
    context.lineTo(x + cardWidth - 32, dividerY - 24);
    context.stroke();
    context.font = "900 26px Arial, sans-serif";
    drawLines(context, judgeVerdictLines[index], x + 32, dividerY + 4, 35);
  });
  y += judgeHeight + 42;

  const columnWidth = (WIDTH - MARGIN * 2 - 24) / 2;
  context.font = "700 27px Arial, sans-serif";
  const consensusLines = report.consensus.map((point) => wrapLines(context, point, columnWidth - 116));
  const consensusHeight = 150 + consensusLines.reduce((total, lines) => total + Math.max(50, lines.length * 36 + 18), 0);
  roundedRect(context, MARGIN, y, columnWidth, consensusHeight, 30, INK);
  drawLabel(context, "The unanimous verdict", MARGIN + 38, y + 48, PAPER);
  context.fillStyle = PAPER;
  context.font = "900 39px Arial, sans-serif";
  context.fillText("DO THESE THREE THINGS FIRST.", MARGIN + 38, y + 100);
  let listY = y + 158;
  consensusLines.forEach((lines, index) => {
    context.fillStyle = VIOLET;
    context.beginPath();
    context.arc(MARGIN + 62, listY + 10, 23, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = PAPER;
    context.font = "900 20px Arial, sans-serif";
    context.textAlign = "center";
    context.fillText(String(index + 1), MARGIN + 62, listY + 17);
    context.textAlign = "left";
    context.font = "700 27px Arial, sans-serif";
    drawLines(context, lines, MARGIN + 104, listY + 18, 36);
    listY += Math.max(50, lines.length * 36 + 18);
  });

  context.font = "700 27px Arial, sans-serif";
  const gapLines = wrapLines(context, report.intentGap, columnWidth - 76);
  const scoresHeight = 390 + gapLines.length * 36;
  const rightHeight = Math.max(consensusHeight, scoresHeight);
  roundedRect(context, MARGIN + columnWidth + 24, y, columnWidth, rightHeight, 30, SUN);
  const rightX = MARGIN + columnWidth + 62;
  drawLabel(context, "Clarity signals", rightX, y + 48);
  const scoreEntries = Object.entries(report.scores);
  scoreEntries.forEach(([label, value], index) => {
    const scoreY = y + 90 + index * 45;
    context.fillStyle = INK;
    context.font = "900 20px Arial, sans-serif";
    context.fillText(label.toUpperCase(), rightX, scoreY + 14);
    for (let dot = 0; dot < 5; dot += 1) {
      context.beginPath();
      context.arc(rightX + 280 + dot * 42, scoreY + 7, 14, 0, Math.PI * 2);
      context.fillStyle = dot < value ? VIOLET : PAPER;
      context.fill();
      context.strokeStyle = INK;
      context.lineWidth = 2;
      context.stroke();
    }
  });
  drawLabel(context, "The intention gap", rightX, y + 290);
  context.fillStyle = INK;
  context.font = "700 27px Arial, sans-serif";
  drawLines(context, gapLines, rightX, y + 340, 36);
  y += Math.max(consensusHeight, rightHeight) + 42;

  drawLabel(context, "Priority rescue plan", MARGIN, y + 22);
  y += 52;
  context.font = "900 31px Arial, sans-serif";
  const improvementTitleLines = report.improvements.map((item) =>
    wrapLines(context, item.title, cardWidth - 64),
  );
  context.font = "700 25px Arial, sans-serif";
  const improvementLines = report.improvements.map((item) => wrapLines(context, item.detail, cardWidth - 64));
  const improvementHeight = Math.max(
    330,
    ...improvementLines.map(
      (lines, index) => 154 + improvementTitleLines[index].length * 36 + lines.length * 34,
    ),
  );
  report.improvements.forEach((item, index) => {
    const x = MARGIN + index * (cardWidth + cardGap);
    roundedRect(context, x, y, cardWidth, improvementHeight, 28, index === 1 ? LAVENDER : index === 2 ? MINT : PAPER);
    context.fillStyle = ORANGE;
    context.font = "900 54px Arial, sans-serif";
    context.fillText(`0${index + 1}`, x + 30, y + 68);
    context.fillStyle = INK;
    context.font = "900 31px Arial, sans-serif";
    drawLines(context, improvementTitleLines[index], x + 30, y + 124, 36);
    context.font = "700 25px Arial, sans-serif";
    drawLines(
      context,
      improvementLines[index],
      x + 30,
      y + 146 + improvementTitleLines[index].length * 36,
      34,
    );
  });
  y += improvementHeight + 42;

  context.font = "700 27px Arial, sans-serif";
  const beforeLines = wrapLines(context, report.example.before, WIDTH - MARGIN * 2 - 110);
  const afterLines = wrapLines(context, report.example.after, WIDTH - MARGIN * 2 - 110);
  const whyLines = wrapLines(context, report.example.why, WIDTH - MARGIN * 2 - 84);
  const exampleHeight = 195 + beforeLines.length * 38 + afterLines.length * 40 + whyLines.length * 34;
  roundedRect(context, MARGIN, y, WIDTH - MARGIN * 2, exampleHeight, 30, SUN);
  drawLabel(context, "Show, don't tell", MARGIN + 42, y + 48);
  let exampleY = y + 94;
  drawLabel(context, "Before", MARGIN + 42, exampleY);
  context.fillStyle = "#626262";
  context.font = "700 27px Arial, sans-serif";
  drawLines(context, beforeLines, MARGIN + 170, exampleY, 38);
  exampleY += Math.max(54, beforeLines.length * 38 + 20);
  drawLabel(context, "After", MARGIN + 42, exampleY);
  context.fillStyle = INK;
  context.font = "900 30px Arial, sans-serif";
  drawLines(context, afterLines, MARGIN + 170, exampleY, 40);
  exampleY += Math.max(58, afterLines.length * 40 + 24);
  context.font = "700 24px Arial, sans-serif";
  drawLines(context, whyLines, MARGIN + 42, exampleY, 34);
  y += exampleHeight + 42;

  context.font = "700 28px Arial, sans-serif";
  const subheadingLines = wrapLines(context, report.rewrite.subheading, WIDTH - MARGIN * 2 - 120);
  context.font = "900 48px Arial, sans-serif";
  const headlineLines = wrapLines(context, report.rewrite.headline, WIDTH - MARGIN * 2 - 84);
  const rewriteHeight = 250 + headlineLines.length * 55 + subheadingLines.length * 38;
  roundedRect(context, MARGIN, y, WIDTH - MARGIN * 2, rewriteHeight, 30, VIOLET);
  drawLabel(context, "Rescued hero copy", MARGIN + 42, y + 48, PAPER);
  context.fillStyle = PAPER;
  context.font = "900 20px Arial, sans-serif";
  context.fillText(report.rewrite.eyebrow.toUpperCase(), MARGIN + 42, y + 96);
  context.font = "900 48px Arial, sans-serif";
  drawLines(context, headlineLines, MARGIN + 42, y + 160, 55);
  context.font = "700 28px Arial, sans-serif";
  const subheadingY = y + 160 + headlineLines.length * 55 + 24;
  drawLines(context, subheadingLines, MARGIN + 42, subheadingY, 38);
  context.fillStyle = SUN;
  context.font = "900 24px Arial, sans-serif";
  context.fillText(`CTA: ${report.rewrite.cta}`, MARGIN + 42, y + rewriteHeight - 38);
  y += rewriteHeight + 42;

  context.fillStyle = INK;
  context.font = "700 18px Arial, sans-serif";
  context.fillText("Subjective clarity signals - review and test before shipping.", MARGIN, y + 20);
  context.textAlign = "right";
  context.fillText("roast-and-rescue", WIDTH - MARGIN, y + 20);
  context.textAlign = "left";
  y += 70;

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = y;
  const finalContext = canvas.getContext("2d");
  if (!finalContext) throw new Error("This browser could not finish the audit export.");
  finalContext.drawImage(draft, 0, 0, WIDTH, y, 0, 0, WIDTH, y);
  return canvas;
}

function triggerDownload(url: string, filename: string) {
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
}

export async function downloadAuditImage(report: RoastReport) {
  const canvas = createAuditCanvas(report);
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((output) => (output ? resolve(output) : reject(new Error("Audit image failed."))), "image/png");
  });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, "roast-and-rescue-audit.png");
  window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
}

export async function downloadAuditPdf(report: RoastReport) {
  const canvas = createAuditCanvas(report);
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4", compress: true });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 24;
  const outputWidth = pageWidth - margin * 2;
  const outputHeight = pageHeight - margin * 2;
  const pixelsPerPage = Math.floor((outputHeight / outputWidth) * canvas.width);

  let sourceY = 0;
  let pageIndex = 0;
  while (sourceY < canvas.height) {
    const sliceHeight = Math.min(pixelsPerPage, canvas.height - sourceY);
    const pageCanvas = document.createElement("canvas");
    pageCanvas.width = canvas.width;
    pageCanvas.height = sliceHeight;
    const pageContext = pageCanvas.getContext("2d");
    if (!pageContext) throw new Error("This browser could not prepare a PDF page.");
    pageContext.fillStyle = SKY;
    pageContext.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
    pageContext.drawImage(canvas, 0, sourceY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
    if (pageIndex > 0) pdf.addPage();
    const renderedHeight = (sliceHeight / canvas.width) * outputWidth;
    pdf.addImage(pageCanvas.toDataURL("image/jpeg", 0.88), "JPEG", margin, margin, outputWidth, renderedHeight);
    sourceY += sliceHeight;
    pageIndex += 1;
  }
  pdf.save("roast-and-rescue-audit.pdf");
}
