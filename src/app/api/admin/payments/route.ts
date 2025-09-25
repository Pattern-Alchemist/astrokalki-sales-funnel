import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { payments } from '@/db/schema';
import { eq, desc, count, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '10')));
    const status = searchParams.get('status');
    
    // Validate status parameter if provided
    const validStatuses = ['created', 'authorized', 'captured', 'failed', 'refunded'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;

    // Build base query
    let paymentsQuery = db.select().from(payments);
    let countQuery = db.select({ count: count() }).from(payments);

    // Apply status filter if provided
    if (status) {
      paymentsQuery = paymentsQuery.where(eq(payments.status, status));
      countQuery = countQuery.where(eq(payments.status, status));
    }

    // Execute queries
    const [paymentsResult, totalResult] = await Promise.all([
      paymentsQuery
        .orderBy(desc(payments.createdAt))
        .limit(pageSize)
        .offset(offset),
      countQuery
    ]);

    const total = totalResult[0].count;

    return NextResponse.json({
      payments: paymentsResult,
      total,
      page,
      pageSize
    }, { status: 200 });

  } catch (error) {
    console.error('GET payments error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}