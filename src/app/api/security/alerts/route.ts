import { NextRequest, NextResponse } from 'next/server';
import { auditor } from '@/lib/gateway-core/SecurityAuditor';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');

    const alerts = await auditor.getRecentAlerts(limit);

    return NextResponse.json({
      success: true,
      data: alerts,
      count: alerts.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Security alerts error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch security alerts' 
      },
      { status: 500 }
    );
  }
}
