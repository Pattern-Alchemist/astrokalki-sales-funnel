import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments, orders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Get the signature from headers
    const signature = request.headers.get('X-Razorpay-Signature');
    if (!signature) {
      console.error('Missing X-Razorpay-Signature header');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Get webhook secret from environment
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET environment variable not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Get raw request body for signature verification
    const body = await request.text();
    
    // Verify signature using HMAC SHA256
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Parse the webhook payload
    const event = JSON.parse(body);
    const { event: eventType, payload } = event;

    console.log(`Processing webhook event: ${eventType}`);

    // Extract optional data for CAPI/GA4
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const clientUserAgent = request.headers.get('user-agent') || undefined;

    switch (eventType) {
      case 'payment.authorized':
      case 'payment.captured':
      case 'payment.failed': {
        const paymentData = payload.payment.entity;
        
        // Find the order by razorpay_order_id
        const existingOrders = await db.select()
          .from(orders)
          .where(eq(orders.razorpayOrderId, paymentData.order_id))
          .limit(1);

        if (existingOrders.length === 0) {
          console.error(`Order not found for razorpay_order_id: ${paymentData.order_id}`);
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        const order = existingOrders[0];

        // Upsert payment record
        const existingPayments = await db.select()
          .from(payments)
          .where(eq(payments.razorpayPaymentId, paymentData.id))
          .limit(1);

        const paymentRecord = {
          razorpayPaymentId: paymentData.id,
          orderId: order.id,
          amount: paymentData.amount,
          currency: paymentData.currency,
          status: paymentData.status,
          method: paymentData.method || null,
          email: paymentData.email || null,
          contact: paymentData.contact || null,
          fees: paymentData.fee || null,
          tax: paymentData.tax || null,
          createdAt: new Date().toISOString()
        };

        if (existingPayments.length > 0) {
          // Update existing payment
          await db.update(payments)
            .set({
              ...paymentRecord,
              createdAt: existingPayments[0].createdAt // Preserve original createdAt
            })
            .where(eq(payments.razorpayPaymentId, paymentData.id));
          
          console.log(`Updated payment record for payment ID: ${paymentData.id}`);
        } else {
          // Insert new payment
          await db.insert(payments)
            .values(paymentRecord);
          
          console.log(`Created payment record for payment ID: ${paymentData.id}`);
        }

        // If payment is captured, update order status
        if (eventType === 'payment.captured') {
          await db.update(orders)
            .set({ status: 'paid' })
            .where(eq(orders.id, order.id));
          
          console.log(`Updated order status to paid for order ID: ${order.id}`);

          // Fire server-side purchase events (non-blocking)
          const valueInr = (paymentData.amount || 0) / 100;
          const currency = paymentData.currency || 'INR';
          const email = (paymentData.email || '').toString();
          const eventId = paymentData.id; // dedupe with client-side pixel
          const transactionId = paymentData.id || order.razorpayOrderId;

          void Promise.allSettled([
            sendGA4Purchase({
              transactionId,
              value: valueInr,
              currency,
              clientId: `srv.${order.razorpayOrderId}`,
              userId: undefined,
            }),
            sendMetaPurchase({
              eventId,
              value: valueInr,
              currency,
              email,
              clientIp,
              clientUserAgent,
            }),
          ]);
        }

        break;
      }

      case 'order.paid': {
        const orderData = payload.order.entity;
        
        // Update order status to paid
        const updatedOrders = await db.update(orders)
          .set({ status: 'paid' })
          .where(eq(orders.razorpayOrderId, orderData.id))
          .returning();

        if (updatedOrders.length === 0) {
          console.error(`Order not found for razorpay_order_id: ${orderData.id}`);
          return NextResponse.json({ error: 'Order not found' }, { status: 404 });
        }

        console.log(`Updated order status to paid for razorpay_order_id: ${orderData.id}`);

        // Attempt server-side purchase events (non-blocking)
        const valueInr = (orderData.amount_paid || 0) / 100;
        const currency = orderData.currency || 'INR';
        const transactionId = orderData.id;
        void Promise.allSettled([
          sendGA4Purchase({
            transactionId,
            value: valueInr,
            currency,
            clientId: `srv.${orderData.id}`,
            userId: undefined,
          }),
          sendMetaPurchase({
            eventId: transactionId,
            value: valueInr,
            currency,
            email: '',
            clientIp,
            clientUserAgent,
          }),
        ]);

        break;
      }

      case 'refund.processed': {
        const refundData = payload.refund.entity;
        
        // Find payment by razorpay_payment_id and update status if needed
        const existingPayments = await db.select()
          .from(payments)
          .where(eq(payments.razorpayPaymentId, refundData.payment_id))
          .limit(1);

        if (existingPayments.length > 0) {
          await db.update(payments)
            .set({ status: 'refunded' })
            .where(eq(payments.razorpayPaymentId, refundData.payment_id));
          
          console.log(`Updated payment status to refunded for payment ID: ${refundData.payment_id}`);
        } else {
          console.warn(`Payment not found for refund payment ID: ${refundData.payment_id}`);
        }

        break;
      }

      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
        break;
    }

    // Respond quickly with 200 status
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

// --- Helpers: Server-side analytics (no-ops if env missing) ---
async function sendGA4Purchase(params: {
  transactionId: string;
  value: number;
  currency: string;
  clientId?: string;
  userId?: string;
}) {
  try {
    const measurementId = process.env.GA4_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA_ID; // fallback
    const apiSecret = process.env.GA4_API_SECRET;
    if (!measurementId || !apiSecret) return;

    const endpoint = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(measurementId)}&api_secret=${encodeURIComponent(apiSecret)}`;

    const body: any = {
      client_id: params.clientId || `srv.${params.transactionId}`,
      user_id: params.userId,
      events: [
        {
          name: 'purchase',
          params: {
            transaction_id: params.transactionId,
            value: params.value,
            currency: params.currency || 'INR',
            engagement_time_msec: 1,
          },
        },
      ],
    };
    if (!params.userId) delete body.user_id;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      // GA collects even if we don't read response; keep it best-effort
    });
    if (!res.ok) {
      const text = await res.text();
      console.warn('GA4 MP failed', res.status, text);
    }
  } catch (e) {
    console.warn('GA4 MP error', e);
  }
}

async function sendMetaPurchase(params: {
  eventId: string;
  value: number;
  currency: string;
  email?: string;
  clientIp?: string | null;
  clientUserAgent?: string;
}) {
  try {
    const pixelId = process.env.FB_PIXEL_ID || process.env.NEXT_PUBLIC_FB_PIXEL_ID; // fallback
    const capiToken = process.env.FB_CONVERSION_API_TOKEN;
    if (!pixelId || !capiToken) return;

    const endpoint = `https://graph.facebook.com/v18.0/${encodeURIComponent(pixelId)}/events?access_token=${encodeURIComponent(capiToken)}`;

    const email = (params.email || '').trim().toLowerCase();
    const hashedEmail = email ? crypto.createHash('sha256').update(email).digest('hex') : undefined;

    const event = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: params.eventId,
      action_source: 'website',
      custom_data: {
        currency: params.currency || 'INR',
        value: params.value,
      },
      user_data: {
        em: hashedEmail ? [hashedEmail] : undefined,
        client_ip_address: params.clientIp || undefined,
        client_user_agent: params.clientUserAgent || undefined,
      },
    } as any;

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [event] }),
    });
    if (!res.ok) {
      const text = await res.text();
      console.warn('Meta CAPI failed', res.status, text);
    }
  } catch (e) {
    console.warn('Meta CAPI error', e);
  }
}