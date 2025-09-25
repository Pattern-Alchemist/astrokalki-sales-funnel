// Server-only Google Calendar utility for booking sync
// Uses a service account (JWT) to obtain access token and insert events.

import { SignJWT, importPKCS8 } from "jose";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";

const SA_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL as string | undefined;
const SA_PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY as string | undefined;
const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID as string | undefined;
const ORG_TZ = process.env.ORG_TIMEZONE || "Asia/Kolkata";

// Helper: get access token using JWT Bearer for service accounts
async function getAccessToken(): Promise<string> {
  if (!SA_EMAIL || !SA_PRIVATE_KEY) {
    throw new Error("Missing Google service account env vars");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" } as const;
  const payload = {
    iss: SA_EMAIL,
    scope: "https://www.googleapis.com/auth/calendar",
    aud: GOOGLE_TOKEN_URL,
    exp: now + 3600,
    iat: now,
  } as const;

  // Private key may contain escaped newlines (\n); normalize for import
  const keyPem = SA_PRIVATE_KEY.replace(/\\n/g, "\n");
  const privateKey = await importPKCS8(keyPem, "RS256");

  const assertion = await new SignJWT(payload)
    .setProtectedHeader(header)
    .setIssuedAt(now)
    .setExpirationTime("1h")
    .setAudience(GOOGLE_TOKEN_URL)
    .setIssuer(SA_EMAIL)
    .sign(privateKey);

  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
    // Force no caching on server
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Google token error: ${res.status} ${text}`);
  }

  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

export interface CalendarInsertParams {
  summary: string;
  description?: string;
  startISO: string; // ISO 8601 start time
  endISO: string;   // ISO 8601 end time
  attendees?: { email: string; displayName?: string }[];
  hangoutLink?: boolean; // request Google Meet link
}

export async function addEventToCalendar(params: CalendarInsertParams): Promise<{ id: string; htmlLink?: string } | null> {
  if (!CALENDAR_ID) {
    // Calendar not configured; skip gracefully
    return null;
  }

  const token = await getAccessToken();

  const body: any = {
    summary: params.summary,
    description: params.description || "",
    start: { dateTime: params.startISO, timeZone: ORG_TZ },
    end: { dateTime: params.endISO, timeZone: ORG_TZ },
    attendees: params.attendees || [],
    reminders: { useDefault: true },
    // Conferencing (Meet) if requested
    ...(params.hangoutLink
      ? { conferenceData: { createRequest: { requestId: `req-${Date.now()}` } } }
      : {}),
  };

  const url = `${GOOGLE_CALENDAR_API_BASE}/calendars/${encodeURIComponent(CALENDAR_ID)}/events${params.hangoutLink ? "?conferenceDataVersion=1" : ""}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Calendar insert error: ${res.status} ${text}`);
  }

  const json = (await res.json()) as { id: string; htmlLink?: string };
  return json;
}