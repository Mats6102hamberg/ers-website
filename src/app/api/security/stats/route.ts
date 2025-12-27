import { NextRequest, NextResponse } from 'next/server';
import { auditor } from '@/lib/gateway-core/SecurityAuditor';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeRange = (searchParams.get('timeRange') || 'day') as 'hour' | 'day' | 'week' | 'month';

    const stats = await auditor.getStats(timeRange);

    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Security stats error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch security statistics' 
      },
      { status: 500 }
    );
  }
}
