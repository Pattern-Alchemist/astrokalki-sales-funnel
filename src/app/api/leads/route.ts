import { NextResponse } from "next/server";
import { db } from '@/db';
import { leads } from '@/db/schema';

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";

    let payload: Record<string, any> = {};
    if (contentType.includes("application/json")) {
      payload = await req.json();
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      formData.forEach((v, k) => {
        payload[k] = v;
      });
    } else {
      // Attempt both, favor JSON
      try { payload = await req.json(); } catch {
        const formData = await req.formData();
        formData.forEach((v, k) => { payload[k] = v; });
      }
    }

    const { email, name = "", message = "" } = payload;
    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Store in database
    try {
      const newLead = await db.insert(leads).values({
        email: email.trim().toLowerCase(),
        createdAt: new Date().toISOString(),
      }).returning();

      console.log("Lead captured:", { email, name, message, ts: new Date().toISOString() });
      
      return NextResponse.json({ ok: true, lead: newLead[0] });
    } catch (dbError) {
      // Handle unique constraint violation
      if (String(dbError).includes('UNIQUE constraint failed')) {
        return NextResponse.json({ error: "Email already exists" }, { status: 409 });
      }
      throw dbError;
    }

  } catch (err) {
    console.error("Lead error", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}