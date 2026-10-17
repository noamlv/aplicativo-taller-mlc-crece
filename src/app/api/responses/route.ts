import { NextResponse } from "next/server";
import { z } from "zod";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

const answerSchema = z.union([
  z.string().max(4000),
  z.array(z.string().max(500)).max(20),
]);

const contactSchema = z.object({
  preferredName: z.string().trim().min(1).max(200),
  phone: z.string().regex(/^9\d{8}$/),
  email: z.string().email().max(254),
}).strict();

const submissionSchema = z.object({
  instrumentId: z.literal("crece-taller-mlc-interes"),
  instrumentVersion: z.string().min(1).max(40),
  consented: z.literal(true),
  context: z
    .object({
      campaign: z.literal("taller-mlc-noviembre-2026"),
    })
    .strict(),
  answers: z.record(z.string(), answerSchema),
  contact: contactSchema,
});

export async function POST(request: Request) {
  const parsed = submissionSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "La respuesta contiene campos incompletos o con un formato no válido." },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({ preview: true, submissionId: crypto.randomUUID() });
  }

  const { data, error } = await supabase
    .from("survey_submissions")
    .insert({
      instrument_id: parsed.data.instrumentId,
      instrument_version: parsed.data.instrumentVersion,
      context: {
        ...parsed.data.context,
        authorizedContact: parsed.data.contact,
      },
      answers: parsed.data.answers,
      source: "web_app",
      status: "received",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Unable to store MLC workshop application", error);
    return NextResponse.json(
      { error: "No se pudo registrar la respuesta. Intente nuevamente." },
      { status: 500 },
    );
  }

  return NextResponse.json({ preview: false, submissionId: data.id });
}
