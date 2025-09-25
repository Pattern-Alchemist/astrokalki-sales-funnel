import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leads } from '@/db/schema';
import { desc, count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse and validate pagination parameters
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '10'), 100);

    // Validate page parameter
    if (page < 1 || isNaN(page)) {
      return NextResponse.json({ 
        error: "Page must be a positive integer",
        code: "INVALID_PAGE" 
      }, { status: 400 });
    }

    // Validate pageSize parameter
    if (pageSize < 1 || isNaN(pageSize)) {
      return NextResponse.json({ 
        error: "Page size must be a positive integer",
        code: "INVALID_PAGE_SIZE" 
      }, { status: 400 });
    }

    // Calculate offset
    const offset = (page - 1) * pageSize;

    // Get total count of leads
    const [totalResult] = await db.select({ count: count() }).from(leads);
    const total = totalResult.count;

    // Get paginated leads ordered by createdAt DESC
    const leadsData = await db.select()
      .from(leads)
      .orderBy(desc(leads.createdAt))
      .limit(pageSize)
      .offset(offset);

    return NextResponse.json({
      leads: leadsData,
      total,
      page,
      pageSize
    }, { status: 200 });

  } catch (error) {
    console.error('GET leads error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}