import { NextResponse } from "next/server";
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { addEventToCalendar } from '@/lib/calendar';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const required = ["name", "email", "dateOfBirth", "timeOfBirth", "placeOfBirth", "modality", "plan"] as const;
    for (const key of required) {
      if (!data?.[key]) {
        return NextResponse.json({ error: `Missing field: ${key}` }, { status: 400 });
      }
    }

    // Extract booking-specific fields and store in database
    const { name, email, phone, topic = data.modality, preferred_date = data.dateOfBirth } = data;
    
    const newBooking = await db.insert(bookings).values({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || null,
      topic: topic,
      preferredDate: preferred_date,
      status: 'pending',
      createdAt: new Date().toISOString(),
    }).returning();

    // Attempt Google Calendar sync (best-effort, non-blocking)
    let calendarEvent: { id: string; htmlLink?: string } | null = null;
    try {
      const startCandidate: string | undefined =
        data.preferredDateTime || data.preferred_date || data.preferredDate || data.slot?.start || undefined;

      if (startCandidate) {
        const startDate = new Date(startCandidate);
        if (!isNaN(startDate.getTime())) {
          const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // default 60 min
          calendarEvent = await addEventToCalendar({
            summary: `Consultation: ${name}`,
            description: [
              `Topic: ${topic}`,
              data.plan ? `Plan: ${data.plan}` : null,
              data.placeOfBirth ? `POB: ${data.placeOfBirth}` : null,
              data.dateOfBirth ? `DOB: ${data.dateOfBirth}` : null,
              data.timeOfBirth ? `TOB: ${data.timeOfBirth}` : null,
            ].filter(Boolean).join('\n'),
            startISO: startDate.toISOString(),
            endISO: endDate.toISOString(),
            attendees: [{ email: email.trim().toLowerCase(), displayName: name.trim() }],
            hangoutLink: true,
          });
        }
      }
    } catch (calendarErr) {
      console.error("Calendar sync failed", calendarErr);
      // do not fail the booking on calendar error
    }

    console.log("Booking request:", { ...data, ts: new Date().toISOString() });

    return NextResponse.json({ ok: true, booking: newBooking[0], calendarEvent });
  } catch (err) {
    console.error("Booking error", err);
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}