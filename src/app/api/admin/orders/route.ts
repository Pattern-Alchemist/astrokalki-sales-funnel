import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq, desc, and, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse pagination parameters
    const pageParam = searchParams.get('page') || '1';
    const pageSizeParam = searchParams.get('pageSize') || '10';
    const status = searchParams.get('status');

    // Validate page parameter
    const page = parseInt(pageParam);
    if (isNaN(page) || page < 1) {
      return NextResponse.json({ 
        error: "Page must be a positive integer",
        code: "INVALID_PAGE" 
      }, { status: 400 });
    }

    // Validate pageSize parameter
    const pageSize = parseInt(pageSizeParam);
    if (isNaN(pageSize) || pageSize < 1) {
      return NextResponse.json({ 
        error: "Page size must be a positive integer",
        code: "INVALID_PAGE_SIZE" 
      }, { status: 400 });
    }

    // Enforce maximum page size
    const validatedPageSize = Math.min(pageSize, 100);
    const offset = (page - 1) * validatedPageSize;

    // Validate status parameter if provided
    const validStatuses = ['created', 'paid', 'failed', 'refunded'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Build where condition
    let whereCondition;
    if (status) {
      whereCondition = eq(orders.status, status);
    }

    // Get total count
    let totalQuery = db.select({ count: count() }).from(orders);
    if (whereCondition) {
      totalQuery = totalQuery.where(whereCondition);
    }
    const totalResult = await totalQuery;
    const total = totalResult[0].count;

    // Get orders with pagination and filtering
    let ordersQuery = db.select().from(orders);
    if (whereCondition) {
      ordersQuery = ordersQuery.where(whereCondition);
    }
    
    const ordersResult = await ordersQuery
      .orderBy(desc(orders.createdAt))
      .limit(validatedPageSize)
      .offset(offset);

    return NextResponse.json({
      orders: ordersResult,
      total,
      page,
      pageSize: validatedPageSize
    }, { status: 200 });

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}