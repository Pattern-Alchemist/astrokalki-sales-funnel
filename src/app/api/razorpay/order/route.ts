import Razorpay from "razorpay";
import { db } from '@/db';
import { orders } from '@/db/schema';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const amount = Number(body?.amount);
    const currency = (body?.currency as string) || "INR";
    const receipt = (body?.receipt as string) || `rcpt_${Date.now()}`;
    const notes = (body?.notes as Record<string, string>) || {};
    const product = (body?.product as string) || "consultation";
    const bookingId = body?.booking_id ? Number(body.booking_id) : null;

    if (!amount || Number.isNaN(amount)) {
      return new Response(JSON.stringify({ error: "Amount (in the smallest currency unit) is required" }), { status: 400 });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return new Response(JSON.stringify({ error: "Razorpay keys not configured on server" }), { status: 500 });
    }

    const razorpay = new Razorpay({ key_id, key_secret });

    const order = await razorpay.orders.create({
      amount, // e.g., 9900 for ₹99.00
      currency, // "INR"
      receipt,
      notes,
    });

    // Store order in database
    const newOrder = await db.insert(orders).values({
      razorpayOrderId: order.id,
      amount,
      currency,
      status: 'created',
      product,
      receipt,
      notes,
      bookingId,
      createdAt: new Date().toISOString(),
    }).returning();

    return new Response(JSON.stringify({ order, dbOrder: newOrder[0] }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });
  } catch (err) {
    console.error("/api/razorpay/order error", err);
    return new Response(JSON.stringify({ error: "Failed to create order" }), { status: 500 });
  }
}