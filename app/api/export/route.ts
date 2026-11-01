import { NextResponse } from "next/server";
import type { RoastReport } from "@/lib/report";
import { createAuditPdf, createAuditPng } from "@/lib/server-audit-export";
import { rateLimit } from "@/lib/server-guardrails";
import { exportReportSchema, firstValidationError } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const limit = rateLimit(request, "export", 20, 10 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Too many exports. Please wait a moment and try again." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    }

    const form = await request.formData();
    const format = form.get("format");
    const rawReport = form.get("report");
    if ((format !== "pdf" && format !== "png") || typeof rawReport !== "string") {
      return NextResponse.json({ error: "Choose a valid audit export format." }, { status: 400 });
    }
    if (rawReport.length > 50_000) {
      return NextResponse.json({ error: "That audit is too large to export." }, { status: 413 });
    }

    let candidate: unknown;
    try {
      candidate = JSON.parse(rawReport);
    } catch {
      return NextResponse.json({ error: "The audit data could not be read." }, { status: 400 });
    }
    const parsed = exportReportSchema.safeParse(candidate);
    if (!parsed.success) {
      return NextResponse.json({ error: firstValidationError(parsed.error) }, { status: 400 });
    }
    const report = parsed.data as RoastReport;
    const output = format === "pdf" ? createAuditPdf(report) : await createAuditPng(report);
    const contentType = format === "pdf" ? "application/pdf" : "image/png";

    return new Response(new Uint8Array(output), {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="roast-and-rescue-audit.${format}"`,
        "Content-Type": contentType,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Audit export failed", error);
    return NextResponse.json({ error: "The audit export failed. Please try again." }, { status: 500 });
  }
}
