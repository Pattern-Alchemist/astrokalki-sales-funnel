import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq, desc, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '10')));
    const status = searchParams.get('status');
    
    // Validate status parameter if provided
    if (status && !['pending', 'confirmed', 'cancelled'].includes(status)) {
      return NextResponse.json({ 
        error: "Invalid status. Must be one of: pending, confirmed, cancelled",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;

    // Build query conditions
    let whereCondition = undefined;
    if (status) {
      whereCondition = eq(bookings.status, status);
    }

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(bookings)
      .where(whereCondition);
    
    const total = totalResult[0]?.count || 0;

    // Get bookings with pagination and filtering
    let query = db
      .select()
      .from(bookings)
      .orderBy(desc(bookings.createdAt))
      .limit(pageSize)
      .offset(offset);

    if (whereCondition) {
      query = query.where(whereCondition);
    }

    const bookingsList = await query;

    return NextResponse.json({
      bookings: bookingsList,
      total,
      page,
      pageSize
    }, { status: 200 });

  } catch (error) {
    console.error('GET bookings error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}