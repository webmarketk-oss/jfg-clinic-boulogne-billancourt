/* JFG CLINIC BOULOGNE-BILLANCOURT — Easy Beauté CRM — PAS MARSEILLE 6 */
import { NextResponse } from "next/server";

const EASY_BEAUTE_URL = "https://easy-beaute.com/api/prospects/rhc";
const CENTER_ID = process.env.EASY_BEAUTE_CENTER_ID || "296";
const CANAL = process.env.EASY_BEAUTE_CANAL || "Web K";

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("33") && digits.length >= 11) return digits.slice(2);
  if (digits.startsWith("0") && digits.length >= 10) return digits.slice(1);
  return digits;
}

export async function POST(request: Request) {
  const apiKey = process.env.EASY_BEAUTE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "EASY_BEAUTE_API_KEY manquante" },
      { status: 500 },
    );
  }

  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalide" }, { status: 400 });
  }

  const firstname = asString(body.firstname);
  const lastname = asString(body.lastname);
  const phone = asString(body.phone);
  const email = asString(body.email);
  const prestation = asString(body.prestation);
  const comment = asString(body.comment);
  const utmSource = asString(body.utm_source);
  const utmMedium = asString(body.utm_medium);

  if (!firstname) {
    return NextResponse.json(
      { ok: false, error: "firstname requis" },
      { status: 400 },
    );
  }

  const payload = new URLSearchParams({
    api_key: apiKey,
    center_id: CENTER_ID,
    firstname,
    lastname: lastname || firstname,
    phone_code: "+33",
    phone: normalizePhone(phone),
    email,
    prestation,
    city: "Boulogne-Billancourt",
    comment,
    canal: CANAL,
    utm_source: utmSource,
    utm_medium: utmMedium,
  });

  try {
    const response = await fetch(EASY_BEAUTE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: payload.toString(),
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { ok: false, error: "easy-beaute", status: response.status, body: text.slice(0, 300) },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "reseau" }, { status: 502 });
  }
}
