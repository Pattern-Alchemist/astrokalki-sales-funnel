import crypto from "crypto";
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(JSON.stringify({ ok: false, error: "Missing verification fields" }), { status: 400 });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return new Response(JSON.stringify({ ok: false, error: "Razorpay secret not configured" }), { status: 500 });
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", key_secret)
      .update(payload)
      .digest("hex");

    const valid = expectedSignature === razorpay_signature;

    if (!valid) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid signature" }), { status: 400 });
    }

    // Update order status to paid upon successful verification
    const updatedOrder = await db.update(orders)
      .set({ status: 'paid' })
      .where(eq(orders.razorpayOrderId, razorpay_order_id))
      .returning();

    return new Response(JSON.stringify({ 
      ok: true, 
      order: updatedOrder[0] || null 
    }), { 
      status: 200, 
      headers: { "Content-Type": "application/json" } 
    });
  } catch (err) {
    console.error("/api/razorpay/verify error", err);
    return new Response(JSON.stringify({ ok: false, error: "Verification failed" }), { status: 500 });
  }
}